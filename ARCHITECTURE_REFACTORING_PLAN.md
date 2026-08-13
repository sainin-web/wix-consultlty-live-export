# Complete Architecture Refactoring Plan

**Status:** 🔴 CRITICAL — Monolithic React app preventing Wix integration  
**Objective:** Separate applications by experience (public, consultant, customer, admin)  
**Target:** < 3 seconds first render (currently 5 minutes)

---

## PROBLEM STATEMENT

### Current Architecture (WRONG)
```
Wix Page
  ↓
Single React App (50MB+ bundle)
  ├─ Socket.IO (initializes globally)
  ├─ Admin code
  ├─ Consultant dashboard
  ├─ Customer wallet
  ├─ Chat/video/calling
  ├─ Firebase
  ├─ Multiple Redux slices
  └─ Everything else
  ↓
WAIT 5 MINUTES
  ↓
FINALLY render public marketplace
```

### Required Architecture (CORRECT)
```
Wix Page "Our Consultants"
  ↓
ONLY Public Storefront Bundle (~100KB)
  ├─ Marketplace shell
  ├─ Consultant listing
  ├─ Consultant card
  └─ Lightweight API client
  ↓
RENDER IMMEDIATELY (< 1 second)
  ↓
Load consultant data asynchronously
```

---

## SOLUTION: SPLIT APPLICATIONS

### 1. PUBLIC STOREFRONT APPLICATION
**Bundle:** `storefront-bundle.js` (~50-100KB gzipped)  
**Entry:** `/src/apps/storefront/index.jsx`  
**Routes:** `/consultant/card`, `/view-profile/:id`

**Includes:**
- Marketplace UI
- Consultant listing
- Consultant card
- Profile view
- Login prompt (Wix member login redirect)

**Does NOT include:**
- Socket.IO
- Video SDK
- Chat code
- Consultant dashboard
- Admin code
- Wallet
- Call history

### 2. CONSULTANT PORTAL APPLICATION
**Bundle:** `consultant-app-bundle.js` (~200-300KB gzipped)  
**Entry:** `/src/apps/consultant/index.jsx`  
**Routes:** `/consultant/login`, `/consultant/dashboard`, `/consultant/profile`, etc.

**Includes:**
- Consultant login
- Consultant dashboard
- Availability management
- Earnings/wallet
- Profile management
- Settings

**Does NOT initialize in storefront.**

### 3. CUSTOMER MEMBER APPLICATION
**Bundle:** `customer-app-bundle.js` (~150-200KB gzipped)  
**Entry:** `/src/apps/customer/index.jsx`  
**Routes:** `/wallet`, `/history`, `/bookings`, `/transactions`

**Leverages:**
- Wix member experience where appropriate
- Custom dashboard for wallet/vouchers/history

**Does NOT load on public storefront.**

### 4. ADMIN DASHBOARD
**Bundle:** `admin-app-bundle.js` (~300-400KB gzipped)  
**Entry:** Already in Wix app settings

**Stays where it is** — admin loads only when accessed via Wix Dashboard, not public storefront.

---

## FILE STRUCTURE REFACTORING

### Before (Monolithic)
```
src/
  ├─ App.js (handles ALL routes, imports everything)
  ├─ index.js (wraps entire app with global providers)
  ├─ components/
  │   ├─ ConsultantCards/
  │   ├─ ConsultantDashboard/
  │   ├─ Chat/
  │   ├─ Video/
  │   ├─ Wallet/
  │   ├─ Admin/
  │   └─ ... (everything mixed together)
  └─ Redux/ (one monolithic store)
```

### After (Modular)
```
src/
  ├─ apps/
  │   ├─ storefront/
  │   │   ├─ index.jsx (entry point)
  │   │   ├─ App.jsx (only storefront routes)
  │   │   ├─ components/
  │   │   │   ├─ Marketplace.jsx
  │   │   │   ├─ ConsultantCard.jsx
  │   │   │   └─ ConsultantGrid.jsx
  │   │   ├─ hooks/
  │   │   │   └─ useConsultantListing.js
  │   │   ├─ api/
  │   │   │   └─ storefrontApi.js
  │   │   └─ store/ (lightweight Redux - consulting listing only)
  │   │
  │   ├─ consultant/
  │   │   ├─ index.jsx (entry point)
  │   │   ├─ App.jsx (consultant routes only)
  │   │   ├─ components/
  │   │   ├─ pages/
  │   │   ├─ hooks/
  │   │   ├─ store/ (consultant auth + profile)
  │   │   └─ api/
  │   │
  │   ├─ customer/
  │   │   ├─ index.jsx
  │   │   ├─ App.jsx
  │   │   ├─ components/
  │   │   └─ ...
  │   │
  │   └─ admin/
  │       └─ (already separate)
  │
  ├─ shared/
  │   ├─ hooks/
  │   │   └─ useWixUser.js (shared)
  │   ├─ api/
  │   │   └─ apiClient.js (shared)
  │   ├─ utils/
  │   └─ context/
  │
  ├─ public-html/
  │   ├─ storefront.html (entry HTML for storefront)
  │   ├─ consultant.html (entry HTML for consultant app)
  │   └─ customer.html (entry HTML for customer app)
  │
  └─ index.js (still exists for admin/main app entry)
```

---

## WEBPACK/BUILD REFACTORING

### Current (WRONG)
```bash
npm run build
→ ONE huge bundle.js (~2MB)
→ Split by React.lazy()
→ All code still loaded in memory
→ Bundle size analysis shows everything included
```

### Required (CORRECT)
```bash
npm run build:storefront
→ storefront-bundle.js (~50KB)
→ Only marketplace code

npm run build:consultant
→ consultant-bundle.js (~200KB)
→ Only consultant dashboard

npm run build:customer
→ customer-bundle.js (~150KB)
→ Only customer features

npm run build:admin
→ admin-bundle.js (~300KB)
→ Only admin

(Each bundle is independently deployable)
```

### Build Configuration Changes

**Option A: Create separate Webpack configs**
- `webpack.storefront.js`
- `webpack.consultant.js`
- `webpack.customer.js`
- `webpack.admin.js`

**Option B: Create separate React apps with create-react-app (simpler)**
- `storefront/` — separate create-react-app project
- `consultant/` — separate create-react-app project
- `customer/` — separate create-react-app project
- `admin/` — separate create-react-app project

**Recommendation:** Option B (separate projects) = cleaner isolation

---

## IMPLEMENTATION PHASES

### PHASE 1: STOREFRONT (CRITICAL — FIRST)

**Goal:** Fast public marketplace, ZERO non-storefront code  
**Timeline:** Week 1-2

**Create:**
```
src/apps/storefront/
  ├─ index.jsx (NEW entry point)
  ├─ App.jsx (NEW — only /consultant/card routes)
  ├─ components/
  │   ├─ StorefrontShell.jsx
  │   ├─ MarketplaceHero.jsx
  │   ├─ ConsultantGrid.jsx
  │   ├─ ConsultantCard.jsx
  │   └─ ConsultantSkeleton.jsx
  ├─ hooks/
  │   └─ useConsultantListing.js
  ├─ pages/
  │   ├─ ConsultantListingPage.jsx
  │   └─ ConsultantProfilePage.jsx
  └─ store/
      └─ storefrontSlice.js (ONLY listing state, not auth)
```

**Delete/Don't Import:**
- ❌ Socket.IO
- ❌ Consultant dashboard code
- ❌ Admin code
- ❌ Chat code
- ❌ Video code
- ❌ Wallet code
- ❌ Call history code
- ❌ Authentication middleware

**API Endpoint:**
```javascript
// NEW dedicated storefront endpoint
GET /api/storefront/consultants?page=1&limit=20

Returns:
{
  consultants: [
    { id, name, image, experience, languages, prices, isActive }
  ],
  pagination: { page, limit, total, hasMore }
}
```

**Performance Target:**
- First render: < 500ms
- Consultant load: < 1000ms
- Total: < 1.5 seconds

### PHASE 2: CONSULTANT PORTAL

**Goal:** Separate authenticated consultant experience  
**Timeline:** Week 2-3

**Create separate app** with:
- Consultant login (`/consultant/login`)
- Dashboard (`/consultant/dashboard`)
- Profile editor (`/consultant/profile`)
- Availability (`/consultant/availability`)
- Earnings (`/consultant/earnings`)

**Loads ONLY when:**
- Consultant navigates to `/consultant/login`
- OR consultant authenticates

**Includes:**
- Socket.IO (when needed)
- Authentication
- Consultant Redux store
- All consultant features

### PHASE 3: CUSTOMER MEMBER AREA

**Goal:** Customer account features leveraging Wix member experience  
**Timeline:** Week 3

**Create:**
- `/wallet` → customer wallet
- `/history` → call history
- `/bookings` → upcoming bookings
- `/transactions` → transaction history

**Loads ONLY when:**
- Customer is Wix member
- Customer needs account features

### PHASE 4: ADMIN (EXISTING)

**Goal:** Keep as is, no changes needed  
**Timeline:** N/A

Admin loads only via Wix Dashboard, never on public storefront.

---

## PERFORMANCE INSTRUMENTATION

### Add Timing Logs Everywhere

```javascript
// Storefront app timing
[STORE_PERF] wix-init: 100ms
[STORE_PERF] react-mount: 200ms
[STORE_PERF] marketplace-render: 50ms
[STORE_PERF] consultants-api-start: 250ms
[STORE_PERF] consultants-api-end: 850ms (600ms network + API time)
[STORE_PERF] consultant-cards-render: 200ms
[STORE_PERF] images-loaded: 1200ms (lazy loading doesn't block)
[STORE_PERF] TOTAL-TIME-TO-INTERACTIVE: 1050ms

// Consultant app timing (only when accessed)
[CONS_PERF] consultant-app-load: 300ms
[CONS_PERF] auth-check: 150ms
[CONS_PERF] dashboard-render: 200ms
[CONS_PERF] data-fetch: 400ms
[CONS_PERF] TOTAL: 1050ms

// Admin timing (only in admin dashboard)
[ADMIN_PERF] admin-app-load: 400ms
[ADMIN_PERF] admin-render: 200ms
```

---

## EXPECTED PERFORMANCE IMPROVEMENTS

### Before (CURRENT)
```
Wix page load
  ↓ (0-100ms)
React app boots
  ↓ (100-200ms)
Global Socket initializes
  ↓ (500-5000ms — socket handshake blocks)
AppStatusProvider validates
  ↓ (1000-3000ms — API call)
Redux initializes (all slices)
  ↓ (200-500ms)
Admin code loaded (not used)
  ↓ (300-500ms)
Chat/video SDKs loaded (not used)
  ↓ (500-1000ms)
Firebase initialized
  ↓ (200-500ms)
Finally routes resolve
  ↓ (100-200ms)
Storefront component mounts
  ↓ (100-200ms)
First API call to consultants
  ↓ (1000-5000ms — slow query)
Skeleton cards show
  ↓ (FINALLY visible after 5+ minutes)
```

**Total: 5+ MINUTES** ❌

### After (REQUIRED)
```
Wix page load
  ↓ (0-100ms)
Storefront app boots (ONLY marketplace code)
  ↓ (100-200ms)
Storefront component mounts
  ↓ (100-200ms)
Skeleton cards render
  ↓ (IMMEDIATELY visible)
Consultant API call starts (async, non-blocking)
  ↓ (500-1000ms)
Consultant cards populate
  ↓ (DONE)
```

**Total: < 1.5 SECONDS** ✅

---

## IMPLEMENTATION STRATEGY

### Option 1: Separate CRA Projects (RECOMMENDED)
**Pros:**
- Complete isolation
- No shared build config
- Clear entry points
- Easy to deploy separately
- No cross-app code loading

**Cons:**
- Shared code duplication
- Multiple package.json files
- More complex deployment

**How:**
```
wix-consultant/
  ├─ packages/
  │   ├─ storefront/ (create-react-app)
  │   ├─ consultant/ (create-react-app)
  │   ├─ customer/ (create-react-app)
  │   └─ shared/ (shared utilities)
  └─ backend/
```

### Option 2: Monorepo with Webpack (COMPLEX)
**Pros:**
- Single package.json
- Shared code easily
- Single deploy

**Cons:**
- Webpack config complexity
- Code splitting still loads bundles
- Risk of cross-app imports

### Recommendation
**Use Option 1 (Separate CRA Projects)**

Each app is completely independent. Entry points are separate. No risk of cross-app code loading. Deployment is simple.

---

## MIGRATION PATH

### Week 1: Storefront
1. Create `storefront/` React app
2. Move marketplace components
3. Create lightweight Redux store (listing only)
4. Create storefront API client
5. Deploy independently
6. **Result:** Fast public marketplace

### Week 2: Consultant App
1. Create `consultant/` React app
2. Move consultant dashboard
3. Create consultant auth + Redux
4. Include socket.io + features
5. Deploy independently

### Week 3: Customer App
1. Create `customer/` React app
2. Move wallet/history/bookings
3. Deploy independently

### Week 4: Integration
1. Update Wix page routing
2. Connect storefront app
3. Add deep links for authenticated experiences
4. Performance testing
5. Production deployment

---

## DEPLOYMENT

### Storefront (`storefront-bundle.js`)
```
Deploy to: CDN or hosting
Size: ~50KB gzipped
Loaded from Wix page "Our Consultants"
Cached aggressively
```

### Consultant (`consultant-bundle.js`)
```
Deploy to: CDN or hosting
Size: ~200KB gzipped
Loaded on demand when `/consultant/login` accessed
Not loaded on public storefront
```

### Customer (`customer-bundle.js`)
```
Deploy to: CDN or hosting
Size: ~150KB gzipped
Loaded on demand for member area
Not loaded on public storefront
```

### Admin
```
Already deployed separately
No changes needed
```

---

## SUCCESS CRITERIA

✅ **Storefront:**
- First visible render: < 500ms
- Consultant cards: < 1.5s total
- No socket connection
- No admin/chat/video code
- Bundle size: < 100KB gzipped

✅ **Consultant App:**
- Loads only when accessed
- Fast login/auth flow
- Dashboard renders properly
- Socket works for real-time features

✅ **Customer Area:**
- Loads only when accessed
- Member features work
- Integrates with Wix member experience

✅ **No Regressions:**
- All existing features still work
- API contracts unchanged
- Authentication preserved
- Admin functionality intact

---

## RISK MITIGATION

**Risk:** Cross-app imports break isolation  
**Mitigation:** Separate package.json, no monorepo imports, shared code only in `@shared/` package

**Risk:** Deployment conflicts  
**Mitigation:** Independent deployments, no shared build

**Risk:** Shared code duplication  
**Mitigation:** Small `@shared/` package for critical utilities only

**Risk:** API contract breaks  
**Mitigation:** Versioned endpoints, backwards-compatible changes

---

## NEXT STEPS

### Immediate (This Week)
1. Decide: Option 1 (separate CRA) vs Option 2 (monorepo)
2. Create project structure
3. Extract storefront components
4. Create storefront bundle
5. Test in Wix

### This is NOT optimization.
This is **architectural refactoring** to separate concerns and eliminate unnecessary code loading.

The goal: **Each user experience loads only what it needs.**

---

**Status:** Ready for implementation  
**Complexity:** HIGH — requires restructuring entire project  
**Payoff:** 5 minutes → < 2 seconds (98% improvement)
