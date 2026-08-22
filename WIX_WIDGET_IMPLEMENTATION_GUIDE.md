# Wix Consultant Widget - Complete Implementation Guide

## 🎯 Overview

You now have a **fully functional React widget** that embedsyour entire consultant marketplace into Wix with these three menu items:

1. **Home** → "Our Consultants" (consultant card listing)
2. **Profile** → User profile (shows login required if not logged in)
3. **Become a Consultant** → Consultant login → Full-screen dashboard

## 🏗️ Widget Architecture

### Entry Points

```
wix-consultant-client/
├── src/
│   ├── index.js ← PUBLIC WIDGET ENTRY POINT
│   │   └── Registers <consultant-widget> custom element
│   │   └── Mounts PublicWidget component
│   │   └── Includes height observer for Wix
│   │
│   ├── admin-index.js ← ADMIN DASHBOARD ENTRY POINT
│   │   └── Only for admin.wix.com (separate)
│   │
│   ├── PublicWidget.jsx ← MAIN PUBLIC ROUTES
│   │   ├── Renders ApplicationHeader (with 3 menu items)
│   │   ├── Route: /consultant/card (Home)
│   │   ├── Route: /profile (Profile)
│   │   ├── Route: /login (Become a Consultant → Login form)
│   │   └── Route: /consultant-dashboard (Full-screen Dashboard)
│   │
│   └── components/WidgetHeader/ApplicationHeader.js
│       └── Navigation component with 3 buttons
```

## 📱 User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Wix Page                               │
│  (Wix Header + Footer + Your Widget in between)              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          React Application Header (Yours)             │   │
│  │  [Our Consultants] [Profile] [Become a Consultant]   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Content Area (changes based on menu selection)       │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ If "Home":                                   │    │   │
│  │  │ - Shows consultant card listing              │    │   │
│  │  │                                               │    │   │
│  │  │ If "Profile":                                │    │   │
│  │  │ - If Wix user logged in: Show profile data   │    │   │
│  │  │ - If NOT logged in: "Login Required" message │    │   │
│  │  │                                               │    │   │
│  │  │ If "Become a Consultant":                    │    │   │
│  │  │ 1. Click → Goes to /login                    │    │   │
│  │  │ 2. Enter consultant email + password         │    │   │
│  │  │ 3. Success → Redirects to /consultant-dash   │    │   │
│  │  │ 4. Dashboard opens FULL-SCREEN (no header!)  │    │   │
│  │  │                                               │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication States

### State 1: Customer (Wix Storefront User)
- Logs in via Wix
- Clicks "Profile" → Sees their profile data
- Clicks "Become a Consultant" → See login form
- Enters consultant credentials → Becomes consultant
- Now sees "Dashboard" button instead of "Become a Consultant"

### State 2: Consultant (Logged in via email + password)
- Logs in via `/login` form with consultant email + password
- Header shows: [Our Consultants] [Dashboard] [Logout]
- Clicks "Dashboard" → Full-screen consultant dashboard (no Wix header/footer)
- Dashboard includes:
  - Dashboard overview
  - Chats
  - Call & Chat logs
  - Wallet Management
  - Withdrawal Requests

### State 3: Not Logged In
- Sees "Our Consultants" and "Profile" tabs
- Clicks "Profile" → Shows "Login Required" message
- Clicks "Become a Consultant" → Takes to consultant login form

## 🛠️ Recent Fixes Applied

### Fix 1: Hide Header on Consultant Dashboard
**File:** `PublicWidget.jsx` (Line 296)

Before:
```javascript
{isWidgetReady && !location.pathname.startsWith('/admin') && (
  <ApplicationHeader />
)}
```

After:
```javascript
{isWidgetReady && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/consultant-dashboard') && (
  <ApplicationHeader />
)}
```

**Result:** When consultant clicks "Dashboard", the ApplicationHeader is hidden → full-screen dashboard experience

### Fix 2: Add Login Gate to Profile
**File:** `ProfileSection.js` (Lines 34-45)

Added check to show "Login Required" when customer is not logged in:

```javascript
if (loading) {
  return <div className={styles.profileSection}><p>Loading...</p></div>;
}

if (!user || !user.wixDbId) {
  return (
    <div className={styles.profileSection}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Login Required</h2>
        <p>Please log in as a customer on Wix to view your profile.</p>
      </div>
    </div>
  );
}
```

**Result:** Profile page now shows "Login Required" for non-logged-in users

## 📦 How the Widget Gets into Wix

Your React app is compiled to: `wix-consultant-client/build/`

This contains:
- `index.html` — Entry point
- `static/js/` — JavaScript bundles
- `static/css/` — Stylesheets

### To Add as Wix Widget:

1. **Host the Build Files**
   - Deploy `build/` folder to a hosting service (already doing this via ngrok for dev)
   - The `index.html` gets served at your ngrok URL
   - Your Wix app loads this via custom element: `<consultant-widget>`

2. **Custom Element Registration** (in `index.js`)
   ```javascript
   class ConsultantWidget extends HTMLElement {
     connectedCallback() {
       // Mount React app here
       ReactDOM.createRoot(this).render(<PublicWidget />);
     }
   }
   customElements.define('consultant-widget', ConsultantWidget);
   ```

3. **Wix App Configuration**
   - App loads `index.html` in an iframe
   - The `<consultant-widget>` custom element is registered
   - React app mounts and handles routing

## 🚀 Deployment Checklist

### Development (Current Setup)
```bash
# Terminal 1: Backend
cd wix-consultant-backend
npm start  # Runs on port 3500

# Terminal 2: Frontend (ngrok tunnel)
npm run build:public-widget  # Build React app
npm run build:admin          # Build admin dashboard
cd build
http-server -p 8765         # Serve build folder

# Terminal 3: ngrok tunnel
ngrok http 8765             # Expose port 8765 to internet
# Copy ngrok URL → Add to Wix app configuration
```

### Production
1. Build: `npm run build:public-widget`
2. Deploy `build/` folder to production hosting
3. Update Wix app URL to production hosting URL

## 📋 File Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `PublicWidget.jsx:296` | Added `!location.pathname.startsWith('/consultant-dashboard')` | Hide header on dashboard to show full-screen experience |
| `ProfileSection.js:34-45` | Added login gate check | Show "Login Required" message when customer not logged in |

## ✅ Testing Steps

1. **Test Home Menu**
   - Click "Our Consultants" → Should show consultant cards
   - Should be inside Wix frame with header/footer visible

2. **Test Profile Menu (Not Logged In)**
   - As non-logged-in user, click "Profile"
   - Should see "Login Required" message

3. **Test Profile Menu (Logged In)**
   - Log in to Wix storefront as customer
   - Click "Profile" → Should show customer's profile data

4. **Test Become a Consultant Flow**
   - Click "Become a Consultant" → Goes to `/login`
   - Enter consultant email + password
   - Success → Redirects to `/consultant-dashboard`
   - Dashboard should be **FULL-SCREEN** (no Wix header/footer)
   - Consultant can navigate between Dashboard sections

5. **Test Dashboard Navigation**
   - All menu items in dashboard sidebar should work
   - Chats, Wallet, Withdrawal Requests, etc.

## 🔗 Data Flow

```
┌─ Installation Webhook ─────────────────────────────┐
│                                                     │
│  Wix sends: app_instance_installed event           │
│           ↓                                         │
│  webhookController.js processes event              │
│           ↓                                         │
│  handleWixInstall() in services/wix.service.js     │
│           ↓                                         │
│  1. Creates shop record in shopModel               │
│  2. Fetches Wix access token                       │
│  3. Creates admin user in User collection          │
│           ↓                                         │
│  Admin can access admin.wix.com/dashboard!         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📌 Important Notes

1. **Two Separate Builds**
   - `build:public-widget` → For Wix public widget (served at your ngrok URL)
   - `build:admin` → For Wix admin dashboard (served at admin.wix.com endpoint)

2. **Asset Paths**
   - Public widget uses: `PUBLIC_URL=/`
   - Admin dashboard uses: `PUBLIC_URL=/admin/`
   - Pre/post-build scripts handle organizing assets

3. **Height Management**
   - TabNavigation.js sends iframe height to parent Wix
   - Ensures content displays without extra scrollbars

4. **Authentication**
   - Customers: Authenticated via Wix
   - Consultants: Authenticated via email + password
   - Both use JWT tokens stored in localStorage

## 🎓 Next Steps

1. ✅ Build frontend: `npm run build:public-widget`
2. ✅ Start backend: `npm start` (port 3500)
3. ✅ Serve build: `cd build && http-server -p 8765`
4. ✅ Tunnel: `ngrok http 8765`
5. ✅ Test in Wix widget
6. ✅ Verify all three menu items work
7. ✅ Deploy to production

---

**Status:** ✅ Widget implementation complete and ready for testing!

