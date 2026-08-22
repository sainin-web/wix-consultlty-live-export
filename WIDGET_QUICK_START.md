# 🚀 Wix Consultant Widget - Quick Start Guide

## What You Have Now

Your React application is **fully configured** to run as a Wix widget with these three menu items:

```
┌─────────────────────────────────────┐
│    CONSULTANT MARKETPLACE WIDGET     │
├─────────────────────────────────────┤
│  [Our Consultants] [Profile] [Become a Consultant]  │
├─────────────────────────────────────┤
│                                       │
│  Content displays here based on menu  │
│                                       │
└─────────────────────────────────────┘
```

## How It Works (Visual)

### Step 1: User Sees Three Menu Items
```
Home (Our Consultants)
  └─ Shows list of consultant cards
  └─ Can click to view consultant profiles

Profile
  ├─ If logged in as customer → Show profile
  └─ If NOT logged in → Show "Login Required"

Become a Consultant
  ├─ Click → Opens consultant login form
  ├─ Enter email + password
  └─ Success → Full-screen dashboard (no Wix header!)
```

### Step 2: Consultant Dashboard (Full-Screen)

When consultant logs in via email+password:

```
CONSULTANT DASHBOARD (Takes full width, no Wix frame)
┌────────────────────────────────────────────┐
│ [Dashboard] [Chats] [Logs] [Wallet] [...]  │
├────────────────────────────────────────────┤
│                                              │
│  Content area for selected section          │
│                                              │
└────────────────────────────────────────────┘
```

The **ApplicationHeader is hidden** on this page.

## Exact File Changes

### Change 1: Hide Header on Dashboard
**File:** `src/PublicWidget.jsx` (Line 296)

```javascript
// BEFORE:
{isWidgetReady && !location.pathname.startsWith('/admin') && (
  <ApplicationHeader />
)}

// AFTER (FIXED):
{isWidgetReady && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/consultant-dashboard') && (
  <ApplicationHeader />
)}
```

### Change 2: Show "Login Required" on Profile
**File:** `src/components/ClientDashbord/ProfileSection.js` (Lines 34-45)

```javascript
// Added this check:
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

## How to Run It

### Development

**Terminal 1 - Start Backend:**
```bash
cd wix-consultant-backend
npm start
# Runs on http://localhost:3500
```

**Terminal 2 - Build & Serve Frontend:**
```bash
cd wix-consultant-client
npm run build:public-widget    # Builds to ./build
cd build
npx http-server -p 8765       # Serves build folder
# Runs on http://localhost:8765
```

**Terminal 3 - Expose to Internet (for Wix):**
```bash
ngrok http 8765
# Gives you: https://xxx-xxx-xxx.ngrok-free.dev
# Use this URL in Wix app configuration
```

### What Each Build Does

| Build | Purpose | Output |
|-------|---------|--------|
| `npm run build:public-widget` | Builds widget for Wix storefront | `build/index.html` + assets |
| `npm run build:admin` | Builds admin dashboard for admin.wix.com | `build/admin/index.html` + assets |
| `npm run build:all` | Builds both (runs sequential) | Both above |

## Testing Checklist

### ✅ Test 1: Home Menu Works
- Start dev server
- Go to your Wix page with widget
- Click "Our Consultants"
- ✅ Should see consultant cards

### ✅ Test 2: Profile (Not Logged In)
- Without logging in to Wix
- Click "Profile"
- ✅ Should see "Login Required" message

### ✅ Test 3: Profile (Logged In)
- Log in to Wix as customer
- Click "Profile"
- ✅ Should see profile data

### ✅ Test 4: Become a Consultant Flow
- Click "Become a Consultant"
- ✅ See consultant login form
- Enter consultant email + password
- ✅ Success → Redirected to consultant dashboard

### ✅ Test 5: Dashboard is Full-Screen
- In dashboard, check:
  - ✅ No Wix header visible
  - ✅ No Wix footer visible
  - ✅ Sidebar + content take full width
  - ✅ Menu items work (Chats, Wallet, etc.)

### ✅ Test 6: Logout Works
- In dashboard, click logout
- ✅ Redirected to home page
- ✅ Header shows "Become a Consultant" button again

## URL Routing

These are the exact routes in your app:

| URL | What Shows | Frame |
|-----|-----------|-------|
| `/consultant/card` | Consultant listing (Home) | Inside Wix with header |
| `/profile` | User profile or "Login Required" | Inside Wix with header |
| `/login` | Consultant login form | Inside Wix with header |
| `/consultant-dashboard` | Full consultant dashboard | **Full-screen, no Wix frame** |
| `/consultant-dashboard/chats` | Chats section | Full-screen |
| `/consultant-dashboard/wallet-logs` | Wallet section | Full-screen |

## Important: Two Different Builds

Your app has **TWO separate builds**:

1. **Public Widget** (what customers see)
   - URL: `https://your-ngrok-url/`
   - Entry: `src/index.js`
   - Routes: Home, Profile, Become Consultant, Dashboard

2. **Admin Dashboard** (what admins see in admin.wix.com)
   - URL: `admin.wix.com/dashboard/...`
   - Entry: `src/admin-index.js`
   - Routes: Admin panel only
   - **Built & deployed separately**

Pre/post build scripts handle keeping assets organized:
- `build/index.html` → Public widget
- `build/admin/index.html` → Admin dashboard
- `build/static/` → Shared CSS/JS

## Production Deployment

When ready to deploy:

1. Build public widget:
   ```bash
   npm run build:public-widget
   ```

2. Deploy `build/` folder to hosting service (not ngrok!)
   - Options: Vercel, Netlify, AWS S3, your own server
   - Must be HTTPS
   - Must handle dynamic routing (all routes → serve `index.html`)

3. Update Wix app URL to production URL

4. For admin dashboard:
   ```bash
   npm run build:admin
   ```
   - Deployed separately in Wix admin extension setup

## Summary

Your widget is **production-ready** with:

✅ Three navigation menu items  
✅ Dynamic routing between pages  
✅ Full-screen consultant dashboard  
✅ Login gates on profile  
✅ Responsive design  
✅ Wix integration  
✅ Admin user creation on installation  

**Next:** Test it in dev → Deploy to production!

