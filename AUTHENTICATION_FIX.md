# Wix App Page Authentication Fix

## Problem Statement

The Consultly storefront in the Wix App Page was showing "instance: missing" error, preventing consultant listings from loading. This was because:

1. **Wrong Mechanism**: Frontend was trying to obtain instance token via `postMessage` from Wix parent
2. **Official Patterns**: Wix App Pages have official mechanisms for providing authentication that the custom element should use
3. **Backend Expectations**: Backend was designed to verify Wix access tokens using Wix's official token-info API, but frontend wasn't sending them

## Solution Architecture

### Backend Changes

**File**: `wix-consultant-backend/Controller/wixStroeFrontController.js`

The `/api/consultant/wix-store-front` endpoint now:
1. Receives Authorization header with Wix access token (from custom element)
2. Calls `resolveWixInstanceFromAuthHeader()` to verify token with Wix
3. Extracts `instanceId` from verified token
4. Looks up shop using `instanceId`
5. Returns consultant list for that shop

**Before**:
```javascript
const instance = authHeader?.split(" ")[1];  // Treated as raw UUID
const findAdmin = await shopModel.findOne({ instanceId: instance });  // Direct match
```

**After**:
```javascript
const resolved = await resolveWixInstanceFromAuthHeader(authHeader);  // Verify with Wix
const instanceId = resolved.instanceId;  // Extract verified ID
const findAdmin = await shopModel.findOne({ instanceId });  // Look up shop
```

**New Endpoint**: `/api/wix-context` (GET)

Allows frontend to verify authentication and obtain shop context:
- Accepts Authorization header with Wix token
- Returns: `{ success, accessToken, shopId, instanceId }`
- Called by frontend during token acquisition phase

### Frontend Changes

**File**: `wix-consultant-client/src/services/wixAuth.js` (NEW)

Comprehensive token acquisition service that tries multiple sources:

1. **URL Query Params**: `?accessToken=...` or `?instance=...`
2. **Custom Element Attributes**: `data-access-token`, `data-instance` on the element
3. **localStorage**: Persisted token from previous session
4. **window.wixContext SDK**: If Wix provides SDK with `getAccessToken()` method
5. **Backend API**: Calls `/api/wix-context` - Wix automatically adds auth headers to internal requests

The service uses exponential backoff to retry token acquisition up to 10 times with 500ms delay.

**File**: `wix-consultant-client/src/components/ConsultantCards/ConsultantListing.js`

Updated to:
- Remove dependency on `useWixInstance()` context (which relied on postMessage)
- Use `waitForWixAccessToken()` to obtain token asynchronously
- Show loading state while waiting for token
- Pass `accessToken` to `fetchConsultants` thunk instead of `instance`

**File**: `wix-consultant-client/src/components/Redux/slices/ConsultantSlices.js`

Updated `fetchConsultants` thunk to:
- Accept `accessToken` parameter instead of `instance`
- Pass token in Authorization header: `Authorization: Bearer ${accessToken}`

## How It Works (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│ WIXCONSULTLY STOREFRONT IN WIX APP PAGE                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────┐
         │ ConsultantListing Component Mounts   │
         └──────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────────────┐
         │ waitForWixAccessToken() Attempts to Get Token        │
         │  - Check URL params                                  │
         │  - Check custom element attributes                  │
         │  - Check localStorage                               │
         │  - Check window.wixContext                          │
         │  - Call /api/wix-context (auto-auth by Wix)        │
         └──────────────────────────────────────────────────────┘
                              │
                              ▼ (Token obtained)
         ┌──────────────────────────────────────────────────────┐
         │ fetchConsultants({ accessToken, page, limit })      │
         │  - Send: Authorization: Bearer ${accessToken}       │
         └──────────────────────────────────────────────────────┘
                              │
                              ▼ (HTTP Request)
     ┌─────────────────────────────────────────────────────────┐
     │ BACKEND: /api/consultant/wix-store-front               │
     │  1. Extract token from Authorization header            │
     │  2. Call resolveWixInstanceFromAuthHeader(token)       │
     │     - Decode JWT locally (if install JWT)             │
     │     - Call Wix token-info API (if OAuth token)        │
     │  3. Get verified instanceId                            │
     │  4. Look up shop: shopModel.findOne({instanceId})     │
     │  5. Query consultants for that shop                   │
     │  6. Return consultant list + pagination               │
     └─────────────────────────────────────────────────────────┘
                              │
                              ▼ (Response with consultants)
         ┌──────────────────────────────────────┐
         │ ConsultantListing Renders Cards      │
         │ - Shows available consultants        │
         │ - Guest can view profiles            │
         │ - Can initiate chat/calls after login│
         └──────────────────────────────────────┘
```

## Key Improvements

1. **Official Wix Patterns**: Uses official `resolveWixInstanceFromAuthHeader()` that backend already supported
2. **Multiple Token Sources**: Handles various ways Wix might provide authentication
3. **Automatic Verification**: Backend verifies tokens with Wix's official token-info API
4. **Backward Compatible**: Falls back to localStorage if token is in cache
5. **Clear Error Messages**: Debug logs show where token came from and why it failed
6. **No postMessage Hacks**: Removes unreliable postMessage-based instance delivery

## Testing Checklist

### Local Development

```bash
# 1. Check backend token verification works
curl -H "Authorization: Bearer YOUR_WIX_TOKEN" \
  http://localhost:3500/api/consultant/wix-store-front

# 2. Check context verification works
curl -H "Authorization: Bearer YOUR_WIX_TOKEN" \
  http://localhost:3500/api/wix-context
```

### Wix Dev Center

- [ ] Create new App Page named "Consultly"
- [ ] Set page ID (slug): `consultly`
- [ ] Enable "Auto-add to menu" option
- [ ] Attach `<our-consultant>` custom element to page
- [ ] Deploy app
- [ ] Visit site as guest
- [ ] Verify consultant cards load without errors
- [ ] Check browser console for debug logs: `[WIX-AUTH]`, `[STOREFRONT]`
- [ ] Verify token is being obtained from one of the sources
- [ ] Test chat/call flows (requires login)

### Production Deployment

- [ ] Ensure WIX_CLIENT_ID and WIX_CLIENT_SECRET are set on backend
- [ ] Verify CORS allows Wix origins: `*.wix.com`, `*.wixsite.com`, etc.
- [ ] Monitor logs for token verification errors
- [ ] Test end-to-end: guest visits → sees consultants → can chat/call after login

## Debugging Tips

### Token Not Being Obtained

Check browser console for `[WIX-AUTH]` logs:
- If all sources fail, it means Wix isn't providing token in any expected way
- Add custom logging to see which source Wix uses in your environment

### Backend Verification Fails

Check backend logs for errors in `resolveWixInstanceFromAuthHeader()`:
- "Invalid access token" - Token format is wrong
- "Failed to handle Wix Installation" - WIX_CLIENT_ID/SECRET issue
- "Token-info API error" - Network issue contacting Wix

### Shop Not Found

If token verifies but shop not found:
- Verify shop was created during Wix install: check `shopModel` collection
- Verify instanceId matches between token and shop document

## Environment Variables Required

**Backend** (`wix-consultant-backend/.env`):
```
WIX_CLIENT_ID=your_wix_client_id
WIX_CLIENT_SECRET=your_wix_client_secret
MVC_BACKEND_PORT=3500
REACT_APP_BACKEND_HOST=http://localhost:3500  # or your deployed URL
```

**Frontend** (`wix-consultant-client/.env`):
```
REACT_APP_BACKEND_HOST=http://localhost:3500  # or your deployed URL
REACT_APP_WIX_SITE_ORIGIN=https://your-wix-site.wixsite.com  # for production
```

## Files Modified

### Backend
- `Controller/wixStroeFrontController.js` - Updated endpoint to use token verification
- `Controller/wixContextController.js` - NEW: Context verification endpoint
- `Routes/wixStroeFrontRoute.js` - Added new route

### Frontend
- `services/wixAuth.js` - NEW: Token acquisition service
- `components/ConsultantCards/ConsultantListing.js` - Uses token-based flow
- `components/Redux/slices/ConsultantSlices.js` - Accepts accessToken parameter

### Documentation
- This file: `AUTHENTICATION_FIX.md`

## Next Steps

1. **Test in Wix Dev Center**: Deploy and test on actual Wix site
2. **Monitor Token Source**: See which mechanism Wix uses to provide token
3. **Add Custom Element Support**: If needed, update custom element to set attributes with token
4. **Document for Team**: Share this authentication pattern for future work
