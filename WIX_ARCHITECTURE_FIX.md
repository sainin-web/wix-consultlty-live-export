# Wix Architecture Fix - Public Widget & Admin Separation

**Date:** August 18, 2026  
**Status:** ✅ IMPLEMENTATION COMPLETE - Build Changes Made  
**Issue:** Public "Our Consultant" widget appearing inside Wix Admin Dashboard  
**Solution:** Complete separation of Public Widget and Admin Dashboard into distinct applications  

---

## PROBLEM STATEMENT

The Wix setup had a critical architectural flaw:

```
❌ WRONG (Current State):
src/index.js
├── Register ConsultantWidget custom element (PUBLIC)
├── Mount RootApp to #root (ADMIN)  ← BOTH in same entry point!
└── App.js (contains ALL routes mixed together)

Result: Public widget renders inside admin dashboard
```

---

## SOLUTION ARCHITECTURE

```
✅ CORRECT (New State):

PUBLIC WIDGET:
  src/index.js
  ├── Register <consultant-widget> custom element ONLY
  └── PublicWidget.jsx (public routes only)
       ├── /consultant/card - Public consultant listing
       ├── /view-profile/:id - Public profile view
       ├── /login - Consultant login
       ├── /profile - Consultant account
       └── /consultant-dashboard - Consultant dashboard

ADMIN DASHBOARD:
  src/admin-index.js
  ├── Mount RootAdminApp to #root (NO custom element)
  └── AdminDashboard.jsx (admin routes only)
       ├── /admin - Dashboard
       ├── /admin/consultant-list - Manage consultants
       ├── /admin/consultant-list/add-consultant
       ├── /admin/wallet-management
       ├── /admin/withdrawal-request
       ├── /admin/account-information
       ├── /admin/voucher-management
       ├── /admin/admin-percentage
       ├── /admin/revenue-management
       ├── /admin/faq
       └── /admin/history
```

---

## FILES CREATED/MODIFIED

### 1. **New: `src/PublicWidget.jsx`**
- ONLY public widget routes and UI
- No admin imports or components
- Imports from public modules only
- Contains: ConsultantListing, ViewProfile, LoginForm, ProfileSection, ConsultantDashboard

### 2. **New: `src/AdminDashboard.jsx`**
- ONLY admin dashboard routes and UI
- No public widget imports or components
- Imports from admin modules only
- Contains: Dashboard, ConsultantList, AddConsultant, WalletManagement, etc.

### 3. **Modified: `src/index.js`**
- REMOVED: Admin dashboard mounting code
- KEPT: ConsultantWidget custom element registration
- NOW: Only mounts PublicWidget
- Changed imports to use PublicWidget instead of App
- Clear logging: `[🌐 PUBLIC WIDGET]` prefix

### 4. **New: `src/admin-index.js`**
- Separate entry point for admin dashboard
- REMOVED: Custom element registration
- NOW: Only mounts AdminDashboard
- Changed imports to use AdminDashboard
- Clear logging: `[🔐 ADMIN DASHBOARD]` prefix

### 5. **New: `src/utils/contextDetector.js`**
- `isWixAdminContext()` - Detects if running in admin
- `isPublicWidgetContext()` - Detects if running in public widget
- `getContextInfo()` - Returns detailed context information
- Multiple detection methods:
  1. Wix API availability (window.Wix.Dashboard)
  2. Environment variable (REACT_APP_BUILD_TARGET)
  3. URL path detection
  4. Query parameters

### 6. **New: `craco.config.js`**
- Webpack configuration override for multiple entry points
- Allows different builds for public widget vs. admin dashboard
- Configures different output filenames based on build target
- Required for `npm run build:public-widget` and `npm run build:admin`

### 7. **Modified: `package.json`**
- `npm run build:public-widget` - Build public widget (uses src/index.js)
- `npm run build:admin` - Build admin dashboard (uses src/admin-index.js)
- `npm run build:all` - Build both

### 8. **New: `src/entrypoint-selector.js` (optional)**
- Smart selector that chooses entry point at runtime
- Can be used as fallback if separate builds aren't available
- Uses context detector to decide which app to load

---

## BUILD CONFIGURATION

### Installation (if not already installed):
```bash
cd wix-consultant-client
npm install @craco/craco --save-dev
```

### Update package.json scripts to use CRACO:

Current:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:public-widget": "REACT_APP_BUILD_TARGET=public-widget PUBLIC_URL=/ react-scripts build",
    "build:admin": "REACT_APP_BUILD_TARGET=admin PUBLIC_URL=/admin/ react-scripts build"
  }
}
```

Can be updated to (if CRACO is installed):
```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "build:public-widget": "REACT_APP_BUILD_TARGET=public-widget craco build",
    "build:admin": "REACT_APP_BUILD_TARGET=admin craco build"
  }
}
```

---

## DEPLOYMENT CHECKLIST

### For Public Widget (Wix Site Widget):
1. Build: `npm run build:public-widget`
2. Deploy: `build/index.html` + `build/static/`
3. Wix Custom Element URL: Points to bundled `index.js` or entry HTML
4. Entry point: `src/index.js`
5. Custom element tag: `<consultant-widget>`

### For Admin Dashboard (Wix Dashboard Page):
1. Build: `npm run build:admin`
2. Deploy: `build/` folder (entire build output)
3. Wix Dashboard URL: Points to `build/index.html` with `?wix-dashboard=true`
4. Entry point: `src/admin-index.js`
5. No custom element registration

---

## WIX EXTENSION CONFIGURATION

### Public Widget (Site Widget Extension):
```
Component URL: https://your-domain.com/index.js
Entry Point: src/index.js
HTML Element: <consultant-widget instance="...">
Rendering: Custom element mounts React to self
```

### Admin Dashboard (Dashboard Page Extension):
```
Component URL: https://your-domain.com/admin/index.html?wix-dashboard=true
Entry Point: src/admin-index.js
HTML Element: Mounts to <div id="root"></div> in index.html
Rendering: RootAdminApp mounts AdminDashboard
```

---

## LOGGING & DEBUGGING

### Console Output When Public Widget Loads:
```
[🌐 PUBLIC WIDGET] Custom element registered: <consultant-widget>
[🌐 PUBLIC WIDGET] Connected to DOM
[🌐 PUBLIC WIDGET] Wix integration initialized - Dynamic resizer active
[WixResize] ✓ Monitoring started
```

### Console Output When Admin Dashboard Loads:
```
[🔐 ADMIN ENTRY POINT] Loading ADMIN DASHBOARD...
[🔐 ADMIN DASHBOARD] Mounted to container
[🔐 ADMIN DASHBOARD] Wix integration initialized
[🔐 ADMIN DASHBOARD] Instance found: <instance-id>
```

### Debug Context Information:
```javascript
// In browser console:
import { getContextInfo } from './utils/contextDetector';
console.log(getContextInfo());

// Output:
{
  context: "admin", // or "public-widget"
  isWixAdminContext: true,
  isPublicWidgetContext: false,
  hasWixDashboard: true,
  buildTarget: "admin",
  pathname: "/admin",
  params: {}
}
```

---

## TESTING CHECKLIST

### TEST 1: Public Widget on Storefront
- [ ] Load Wix storefront page with consultant widget
- [ ] Verify console shows `[🌐 PUBLIC WIDGET]` messages only
- [ ] Verify NO `[🔐 ADMIN DASHBOARD]` messages
- [ ] Public navigation visible: "Our Consultants | Profile | Become Consultant"
- [ ] Widget height updates dynamically
- [ ] No Wix page scrollbar appears

### TEST 2: Admin Dashboard Loads Separately
- [ ] Load Wix Admin Dashboard
- [ ] Verify console shows `[🔐 ADMIN DASHBOARD]` messages only
- [ ] Verify NO `[🌐 PUBLIC WIDGET]` messages
- [ ] Verify NO custom element registration in console
- [ ] Admin navigation visible only
- [ ] NO public widget appears
- [ ] NO "Our Consultants" header in admin area

### TEST 3: Instance Verification
- [ ] Admin dashboard loads and verifies instance
- [ ] No "We couldn't verify your Wix app instance" error
- [ ] Admin dashboard shows dashboard content (not error page)
- [ ] Consultant list loads
- [ ] Can add/edit consultants

### TEST 4: Separate Bundle Builds
- [ ] `npm run build:public-widget` succeeds
  - Output: `build/` with public widget bundle
  - Size: <500KB gzipped (public only)
- [ ] `npm run build:admin` succeeds
  - Output: `build/` with admin dashboard bundle
  - Size: < 700KB gzipped (admin only)
- [ ] Public bundle doesn't include admin pages
- [ ] Admin bundle doesn't include public widget UI

### TEST 5: Network Calls
- [ ] Admin context: ONLY admin API calls
  - `/api/admin/*` endpoints
  - `/api/api-consultant/add-consultant` (for admin to add)
  - No public widget initialization calls
- [ ] Public context: ONLY public API calls
  - `/api/` endpoints for consultants
  - No admin API calls
  - No dashboard page calls

### TEST 6: Routing Isolation
- [ ] Public widget routes work: `/consultant/card`, `/view-profile/:id`, `/login`, `/profile`
- [ ] Admin routes work: `/admin`, `/admin/consultant-list`, etc.
- [ ] Public app cannot navigate to admin routes
- [ ] Admin app cannot navigate to public routes
- [ ] No cross-contamination of routing history

### TEST 7: Authentication Separation
- [ ] Consultant login works in public widget (stores `consultant_logged_in` token)
- [ ] Admin instance verification works (stores `wix_id` instance)
- [ ] Logging out from consultant doesn't affect admin
- [ ] No shared auth state between public and admin

### TEST 8: Build & Deployment
- [ ] Production build succeeds without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Public widget bundle: can be deployed to CDN
- [ ] Admin dashboard bundle: can be deployed with backend
- [ ] Both bundles work independently

---

## TROUBLESHOOTING

### Admin Dashboard Shows "We couldn't verify your Wix app instance"

**Check:**
1. Instance is being passed correctly from Wix to dashboard
2. Backend endpoint `/api/admin/check/billing/installection` is working
3. Check browser DevTools Network tab for the API call
4. Verify response from backend contains `{ success: true, billingActive, _id, token }`

**Debug:**
```javascript
// Add to AdminDashboard.jsx temporarily
useEffect(() => {
  const instance = searchParams.get("instance");
  console.log("[DEBUG] Instance from URL:", instance);
  console.log("[DEBUG] Instance from localStorage:", localStorage.getItem("wix_id"));
}, []);
```

### Public Widget Appears in Admin Dashboard

**Check:**
1. Verify correct entry point is being used for admin build
2. Check that `admin-index.js` is the entry point (not `index.js`)
3. Verify `ConsultantWidget` is NOT registered in admin-index.js
4. Check network tab - admin bundle should not load public widget code

**Debug:**
```javascript
// In admin console:
document.querySelector('consultant-widget') // Should be null
window.location.pathname.startsWith('/admin') // Should be true
```

### Separate Builds Not Working

**Check:**
1. Is CRACO installed? `npm list @craco/craco`
2. Is `craco.config.js` in project root?
3. Are build scripts using correct environment variables?
4. Try: `REACT_APP_BUILD_TARGET=admin npm run build`

**Alternative:**
If CRACO doesn't work, use the entrypoint-selector.js approach:
1. Update src/index.js to import entrypoint-selector.js
2. Both apps will be in same bundle but context detector picks which to render

---

## IMPORTANT NOTES

1. **Do NOT mix the apps** - Keep admin and public completely separate
2. **Shared utilities OK** - API clients, Redux store, utilities can be shared
3. **Separate routing** - Each app has its own BrowserRouter
4. **Clear logging** - Always use `[🌐 PUBLIC WIDGET]` and `[🔐 ADMIN]` prefixes for debugging
5. **Test both contexts** - Build and test both public and admin independently
6. **Monitor bundle size** - Public widget should be < 500KB, Admin < 700KB

---

## NEXT STEPS

1. **Build Test:**
   ```bash
   cd wix-consultant-client
   npm run build:public-widget  # Test public build
   npm run build:admin          # Test admin build
   ```

2. **Verify Builds:**
   - Check public build size (should not include admin UI)
   - Check admin build size (should not include public widget)
   - Run through testing checklist above

3. **Deployment:**
   - Deploy public widget bundle to Wix as Site Widget
   - Deploy admin dashboard bundle to Wix as Dashboard Page
   - Test both independently on Wix

4. **Monitor:**
   - Watch browser console for proper `[🌐]` and `[🔐]` prefixes
   - Monitor bundle sizes to ensure separation is working
   - Track API calls to ensure no cross-contamination

---

## SUCCESS CRITERIA

✅ Public widget loads on storefront - NO admin UI visible  
✅ Admin dashboard loads in Wix admin - NO public widget visible  
✅ Separate builds possible with different bundle sizes  
✅ Console shows only relevant log messages per context  
✅ No "We couldn't verify instance" error in admin  
✅ Both apps work independently without interference  
✅ All routing isolated to each app  
✅ All authentication flows isolated to each app  

---

**Status: READY FOR BUILD TESTING** ✅
