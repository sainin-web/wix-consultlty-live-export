# Wix Storefront Consultly Integration - Complete Implementation Guide

**Date**: August 31, 2026  
**Status**: READY TO DEPLOY  
**Commit**: e2550b7

## EXECUTIVE SUMMARY

Fixed the "instance: missing" blocker that prevented Consultly storefront from loading in Wix App Pages. Replaced non-functional postMessage-based authentication with proper Wix Client token verification.

**Problem**: Frontend tried to get instance via postMessage (Wix App Pages don't provide it that way)  
**Solution**: Frontend obtains Wix access token via backend /api/wix-context endpoint; backend verifies with Wix token-info API

---

## PART 1: ARCHITECTURE OVERVIEW

### Previous Architecture (BROKEN)
```
Wix App Page
    ↓
<consultly-widget> custom element
    ↓ (postMessage REQUEST_INSTANCE)
Wix parent [NEVER RESPONDS]
    ↓
Frontend waits indefinitely
    ↓
"instance: missing" error
    ↓
Consultants never load ❌
```

### New Architecture (FIXED)
```
Wix App Page
    ↓
<consultly-widget> custom element mounts
    ↓
Call /api/wix-context [Wix auto-adds auth headers]
    ↓
Backend verifies token with Wix token-info API
    ↓
Backend returns: { accessToken, shopId, instanceId }
    ↓
React mounts with WixAuthProvider
    ↓
ConsultantListing waits for: auth.status === "authenticated"
    ↓
Dispatch fetchConsultants with Authorization header
    ↓
Backend verifies token, resolves shop, returns consultants
    ↓
Consultant cards render ✅
```

---

## PART 2: FILES CHANGED

### Frontend Source Files

**`src/consultly-widget.js`** (COMPLETE REWRITE)
- Removed postMessage REQUEST_INSTANCE retry loop
- Removed _requestInstanceFromWix() and _setupWixMessageListener()
- New: Calls backend /api/wix-context to get authenticated context
- New: Passes authState to React tree via WixAuthProvider
- Cleaner error handling with proper console logging

**`src/ConsultlyWidget.jsx`** (SIMPLIFIED)
- Removed postMessage event listener
- Removed instance resolution logic
- Now just uses authState from props
- Sets Redux wix_access_token when authenticated

**`src/components/ConsultantCards/ConsultantListing.js`** (REFACTORED)
- Removed WixInstanceContext dependency
- Added useWixAuth() hook for authenticated state
- Now waits for: `authState.status === "authenticated"`
- Passes accessToken to fetchConsultants Redux thunk
- Shows proper loading/error states based on auth status

**`src/useContext/WixAuthContext.js`** (NEW FILE)
- Single source of auth truth for entire widget
- Manages: { status, accessToken, instanceId, shopId, error }
- useWixAuth() hook for components
- getWixAuthorizationHeader() helper

### Backend Files

**`Controller/wixStroeFrontController.js`** (ENHANCED)
- Now uses resolveWixInstanceFromAuthHeader() to verify tokens
- Extracts instanceId from verified token
- Proper console logging: [WIX-AUTH], [STOREFRONT]
- Cleaner error handling

**`Controller/wixContextController.js`** (NO CHANGES NEEDED - ALREADY CORRECT)
- Verifies Wix access tokens
- Returns verified instanceId and shopId
- Proper console logging

---

## PART 3: BUILD INSTRUCTIONS

### Prerequisites
```bash
# Ensure you have:
# - Node.js v18+
# - npm v9+
# - Backend running with WIX_CLIENT_ID and WIX_CLIENT_SECRET set
```

### Step 1: Clean Previous Builds
```bash
cd wix-consultant-client
npm run build:clean
```

### Step 2: Build Consultly Widget
```bash
npm run build:consultly
```

**What this does:**
- Builds with REACT_APP_BUILD_TARGET=consultly
- Entry point: src/consultly-widget.js
- Output: .build-temp/consultly/
- Creates consultly-widget.js loader
- Creates consultly-main.latest.js bundle

**Expected output:**
```
[CRACO CONFIG] Building for: consultly
[CRACO CONFIG] Output folder: .build-temp/consultly
[CRACO CONFIG] Entry point: src/consultly-widget.js
...
[POST-BUILD CONSULTLY] ✓ Created consultly-widget.js loader
[POST-BUILD CONSULTLY] ✓ Done.
```

### Step 3: Verify Build Output
```bash
ls -la wix-consultant-client/.build-temp/consultly/
# Should contain:
# - consultly-widget.js (loader - NEVER CHANGES)
# - static/js/consultly-main.latest.js (compiled React app)
# - static/ folder with chunks and CSS
```

### Step 4: Deploy to Hosting
The current production location is:
```
https://test-wix-consultant.zend-apps.com/consultly-widget.js
```

Upload `.build-temp/consultly/` contents to your hosting:
```bash
# Example with rsync:
rsync -av wix-consultant-client/.build-temp/consultly/ \
  user@test-wix-consultant.zend-apps.com:/var/www/consultly/

# Or with scp:
scp -r wix-consultant-client/.build-temp/consultly/* \
  user@test-wix-consultant.zend-apps.com:/var/www/consultly/
```

### Step 5: Deploy Backend
```bash
cd wix-consultant-backend

# Ensure .env has:
WIX_CLIENT_ID=your_wix_client_id
WIX_CLIENT_SECRET=your_wix_client_secret
MVC_BACKEND_PORT=3500
REACT_APP_BACKEND_HOST=http://localhost:3500  # or your deployed URL

# Start/restart backend:
npm run dev  # or your deployment command
```

---

## PART 4: WIX DEV CENTER CONFIGURATION

### Create/Verify Site Widget

**Path**: Dev Center → App → Components → Site Widgets

**Widget Name**: `Consultly`
```
Name: Consultly
Description: Consultant marketplace storefront
```

**Component Settings**:
```
Tag name: consultly-widget
Script URL: https://test-wix-consultant.zend-apps.com/consultly-widget.js
Type: Custom Element
```

### Create/Verify Site Page

**Path**: Dev Center → App → Pages → Add Page

**Page Settings**:
```
Page name: Consultly
Page ID: consultly  (This becomes: /consultly in Wix site)
Page type: Blank
```

**Widget Placement**:
1. Go to "Add widgets to this page"
2. Select: **Consultly** / **consultly-widget**
3. Check: "Add this page automatically to the site menu after installation"

**Result**: When the app is installed, Wix automatically:
- Creates a page named "Consultly" with ID "consultly"
- Adds the `<consultly-widget>` element to the page
- Adds "Consultly" to the site's navigation menu

---

## PART 5: CONSOLE LOG EXPECTATIONS

### Success Case

When everything works, you should see these logs:

**Custom Element**:
```
[CONSULTLY] Custom element mounted
[WIX-AUTH] Initializing Wix authentication...
[WIX-AUTH] Calling /api/wix-context for authenticated context...
[WIX-AUTH] ✓ Authenticated via backend
[WIX-AUTH] instanceId: 6a8800b8604d3dc868fb82bb
[WIX-AUTH] shopId: 6a8800b8604d3dc868fb82bb
```

**Backend**:
```
[WIX-AUTH] Verifying Wix context
[WIX-AUTH] ✓ Token verified
[WIX-AUTH] instanceId: 6a8800b8604d3dc868fb82bb
[WIX-AUTH] shopId: 6a8800b8604d3dc868fb82bb
```

**React Component**:
```
[CONSULTLY-WIDGET] Initializing with auth state: authenticated
[CONSULTLY-WIDGET] Authenticated - ready to fetch consultants
[STOREFRONT] Auth status: authenticated
[STOREFRONT] Authenticated - fetching consultants
[STOREFRONT] Fetching consultants
[STOREFRONT] ✓ Consultants returned: 5
```

**Final Result**: Consultant cards display on the page ✅

### Error Cases

**No Authorization Header**:
```
[WIX-AUTH] ✗ No authorization header
response: { success: false, message: "No authorization header" }
→ AuthState.status = "error"
→ Shows "Unable to load consultants" error message
```

**Invalid Token**:
```
[WIX-AUTH] ✗ Token verification failed: Invalid access token
response: { success: false, message: "Unauthorized" }
→ AuthState.status = "error"
→ Shows "Unable to load consultants" error message
```

**Shop Not Found**:
```
[WIX-AUTH] ✓ Token verified
[WIX-AUTH] instanceId: xyz
[WIX-AUTH] ✗ Shop not found for instanceId: xyz
response: { success: false, message: "Shop not found for instance" }
→ AuthState.status = "error"
→ Shows "Unable to load consultants" error message
```

---

## PART 6: TEST PROCEDURE

### Test 1: Local Development

```bash
# Terminal 1: Start backend
cd wix-consultant-backend
npm run dev

# Terminal 2: Build consultly
cd wix-consultant-client
npm run build:consultly

# Terminal 3: Serve build
cd wix-consultant-client/.build-temp/consultly
npx http-server -p 8000
```

Open browser: `http://localhost:8000/consultly-widget.js`
- Should return loader script
- Should load consultly-main.latest.js

### Test 2: Wix Dev Center (Recommended)

**Step 1**: In Wix Dev Center, update script URL to point to your deployed hosting or local server

**Step 2**: Test App
1. Open Dev Center → Test App
2. Navigate to the "Consultly" page
3. Check browser console for expected logs (see PART 5)
4. Verify consultant cards appear

**Success Criteria**:
- ✅ No "instance: missing" error
- ✅ No postMessage request messages
- ✅ Console shows [WIX-AUTH] verified message
- ✅ Console shows [STOREFRONT] consultants returned: N
- ✅ Consultant cards visible
- ✅ Can click "View Profile" button
- ✅ Can click "Chat" button (shows login prompt if not logged in)

### Test 3: Guest vs. Authenticated

**As Guest**:
- Consultant cards should load
- Clicking "Chat" or "Call" shows login modal
- Modal has "Login" and "Cancel" buttons
- Click "Login" navigates to login page

**As Logged-In Member**:
- Consultant cards should load
- Clicking "Chat" should work
- Clicking "Call" should work

### Test 4: Network Inspection

Open DevTools → Network tab

**Successful Request**:
```
GET /api/wix-context
Headers:
  Authorization: Bearer <wix-token>
Response: {
  "success": true,
  "accessToken": "...",
  "shopId": "...",
  "instanceId": "..."
}
```

**Successful Consultant Fetch**:
```
GET /api/consultant/wix-store-front?page=1&limit=12
Headers:
  Authorization: Bearer <wix-token>
Response: {
  "success": true,
  "findConsultant": [...],
  "pagination": { ... }
}
```

---

## PART 7: TROUBLESHOOTING

### Symptom: "Unable to load consultants" Message

**Check 1**: Backend is running
```bash
curl http://localhost:3500/api/wix-context
# Should return 401 with message "No valid Wix authentication found"
# (401 is expected without Wix auth)
```

**Check 2**: WIX_CLIENT_ID and WIX_CLIENT_SECRET are set
```bash
echo $WIX_CLIENT_ID
echo $WIX_CLIENT_SECRET
```

**Check 3**: Backend logs show [WIX-AUTH] messages
```bash
# Look for:
[WIX-AUTH] Verifying Wix context
[WIX-AUTH] ✓ Token verified
```

### Symptom: postMessage Errors in Console

**Old Code**: If you see this, build is stale
```
[CONSULTLY] Requesting instance from Wix parent (attempt 1/3)...
```

**Fix**: Rebuild and redeploy
```bash
npm run build:consultly
# Upload new consultly-main.latest.js to hosting
```

### Symptom: Consultant Cards Don't Load (But No Error)

**Check 1**: authState.status in console
```bash
# Should show: [CONSULTLY-WIDGET] Initializing with auth state: authenticated
# If it says "error" or "loading", auth isn't completing
```

**Check 2**: /api/consultant/wix-store-front response
```bash
# In DevTools Network tab, check the response
# Should have "findConsultant" array with consultant objects
```

**Check 3**: ConsultantListing component state
```bash
# Add to ConsultantListing for debugging:
console.log("consultants state:", consultants);
console.log("loading state:", loading);
console.log("error state:", error);
```

---

## PART 8: WHAT WAS REMOVED

### Removed Code (Safe to Delete if Found)

❌ **`src/services/wixAuth.js`** (Old service file)
- Used postMessage and retry loops
- Replaced by WixAuthContext

❌ **`src/useContext/WixInstanceContext.js`** (Old context)
- Used postMessage and localStorage
- Replaced by WixAuthContext
- IMPORTANT: Don't break existing code that imports it yet

❌ **`src/ConsultlyWidget.jsx` old imports**:
- `checkWixInstance` dispatch
- `setInstance` dispatch
- These are now handled in consultly-widget.js

### What Was NOT Removed (Preserved)

✅ **Admin Dashboard** (`src/admin-index.js`)
- Completely unchanged
- Still works as before

✅ **Public Widget** (`src/index.js`)
- Completely unchanged
- Still works as before

✅ **Redux Store**
- ConsultantSlices still works
- Just now receives accessToken instead of instance

✅ **Backend Admin Routes**
- Completely unchanged
- Admin dashboard still works

---

## PART 9: DEPLOYMENT CHECKLIST

- [ ] Commit code: `git commit -m "Fix Wix Storefront..."`
- [ ] Build frontend: `npm run build:consultly`
- [ ] Verify build: `ls .build-temp/consultly/consultly-widget.js`
- [ ] Upload to hosting: rsync or scp to production server
- [ ] Verify URL: `curl https://test-wix-consultant.zend-apps.com/consultly-widget.js`
- [ ] Deploy backend: Restart or redeploy backend service
- [ ] Verify backend: `curl http://your-backend/api/wix-context` (should return 401)
- [ ] Test in Wix Dev Center: Open Test App → Consultly page
- [ ] Verify logs: Console shows [WIX-AUTH] and [STOREFRONT] messages
- [ ] Verify UI: Consultant cards appear
- [ ] Test interactions: Click View Profile, Chat, Call buttons
- [ ] Update Wix App Version: Release new version if needed
- [ ] Install on production site: Test on actual Wix site

---

## PART 10: ACCEPTANCE CRITERIA - FINAL VERIFICATION

✅ **No "instance: missing" error**
```
// Should NOT see:
[CONSULTLY] Could not obtain Wix instance after 3 attempts
[CONSULTLY] Widget is in standalone/fallback mode
instance: missing
```

✅ **Proper authentication flow**
```
// Should see:
[CONSULTLY] Custom element mounted
[WIX-AUTH] ✓ Authenticated via backend
[STOREFRONT] Authenticated - fetching consultants
[STOREFRONT] ✓ Consultants returned: N
```

✅ **Consultant cards render**
- At least one consultant card visible
- Card shows: Name, profession, image, pricing
- Buttons work: View Profile, Chat, Call

✅ **Guest visitor experience**
- Can view consultant cards without login
- Clicking Chat/Call shows login prompt
- "Login" button navigates to login page

✅ **Menu integration**
- "Consultly" appears in Wix site navigation
- Clicking "Consultly" goes to /consultly page
- Page is auto-added after app installation

✅ **No console errors**
- Network tab shows successful requests
- No 4xx/5xx errors (except 401 for unauth requests)
- All fetch requests complete successfully

---

## QUESTIONS & ANSWERS

**Q: Why remove postMessage?**  
A: Wix App Pages don't send postMessage with instance. They auto-authenticate requests to your backend instead.

**Q: Why call /api/wix-context from frontend?**  
A: When Wix loads the page, it automatically adds auth headers to requests. This gives us verified Wix context.

**Q: What if I still need instance?**  
A: Backend extracts instanceId from the verified token, so you have it. It's used to look up the shop.

**Q: Will this work for external URLs?**  
A: No, external URLs won't get automatic Wix auth headers. Only Wix App Pages do.

**Q: Can I still use the admin dashboard?**  
A: Yes, completely unchanged. This only affects the storefront widget.

---

## CONTACT & SUPPORT

If consultant cards still don't load after following this guide:

1. Check all console logs (copy them completely)
2. Check Network tab for /api/wix-context response
3. Check backend logs for [WIX-AUTH] messages
4. Verify WIX_CLIENT_ID and WIX_CLIENT_SECRET are set
5. Verify script URL is correct in Wix Dev Center

The logs will show exactly where authentication failed.
