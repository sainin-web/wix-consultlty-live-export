# 🎯 CONSULTLY ON WIX STOREFRONT - SETUP GUIDE

## ✅ STATUS: READY TO DEPLOY

Your Consultly React application is built and running. Ready to add to Wix storefront navigation.

---

## 📍 CONSULTLY APPLICATION URL

**Use this URL in Wix:**
```
https://viewy-hyperintelligently-toshiko.ngrok-free.dev
```

This serves your Consultly React app with:
- ✅ Home | Profile | Become a Consultant navigation
- ✅ Consultant card listings
- ✅ Profile section with login gate
- ✅ Consultant login & full-screen dashboard
- ✅ No Wix admin modifications

---

## 🔧 WIXSTUDIO SETUP STEPS

### Step 1: Open Your Wix Site Settings
1. Go to **Wix Studio**
2. Open your **Consultant App's Wix site**
3. Click **Edit** on your site

### Step 2: Add Navigation Item
1. Click the **Wix Header/Navigation** at the top of your site
   - Or go to **Layout** → **Navigation**
2. Look for the menu structure: `Home | Shop | More`
3. Click **Add Item** or **+** to add a new menu item

### Step 3: Configure "Consultly" Menu Item
1. **Label:** `Consultly`
2. **Link Type:** Choose "External Link"
3. **URL:** Paste exactly:
   ```
   https://viewy-hyperintelligently-toshiko.ngrok-free.dev
   ```
4. **Target:** (Optional) Leave blank or choose "Same Window"
5. **Click Save**

### Step 4: Verify Navigation
Your menu should now show:
```
Home | Shop | Consultly | More
```

### Step 5: Publish & Test
1. Click **Publish** to save changes
2. Go to your **live Wix storefront**
3. Click **Consultly** in the navigation
4. Verify it loads the Consultly React app

---

## ✨ EXPECTED RESULT

When user clicks "Consultly" on your Wix storefront:

```
┌─────────────────────────────────────────┐
│        Wix Storefront Header             │
│   Home | Shop | Consultly | More         │
├─────────────────────────────────────────┤
│          CONSULTLY REACT APP              │
│     Home | Profile | Become a Consultant │
├─────────────────────────────────────────┤
│                                           │
│  Consultant Listing / Profile / Login    │
│  Full-screen Dashboard on consultant     │
│  login (consultant-dashboard route)      │
│                                           │
├─────────────────────────────────────────┤
│        Wix Storefront Footer              │
└─────────────────────────────────────────┘
```

### Layout Breakdown:
- **Top:** Wix storefront header remains visible ✅
- **Below Wix header:** Consultly React header appears (Home | Profile | Become a Consultant) ✅
- **Content area:** Consultant cards, profile, or full-screen dashboard ✅
- **Footer:** Wix footer remains visible ✅

---

## 🚀 LOCAL DEVELOPMENT (During Testing)

### Terminal 1: Backend API
```bash
cd wix-consultant-backend
npm start
# Runs on http://localhost:3500
```

### Terminal 2: Serve Frontend
```bash
cd wix-consultant-client/build
npx http-server -p 8765
# Runs on http://localhost:8765
# Exposed via ngrok at: https://viewy-hyperintelligently-toshiko.ngrok-free.dev
```

### Terminal 3: Verify ngrok tunnel
```bash
# ngrok should already be running
# Test with: curl https://viewy-hyperintelligently-toshiko.ngrok-free.dev
```

---

## 🎯 FEATURES AVAILABLE

When users click "Consultly" in your Wix storefront:

✅ **Home** (Default Route)
- View list of consultant cards
- Click to view full consultant profile
- Inside Wix frame with header/footer

✅ **Profile**
- Shows user profile if logged into Wix as customer
- Shows "Login Required" if not logged in
- Inside Wix frame with header/footer

✅ **Become a Consultant**
- Consultant login form (email + password)
- Only consultants with credentials can log in
- Successful login → Full-screen dashboard
- Inside Wix frame with header/footer initially

✅ **Consultant Dashboard** (Full-Screen)
- After consultant login
- **NO Wix header visible**
- **NO Wix footer visible**
- Takes full width of browser
- Sidebar navigation:
  - Dashboard
  - Chats
  - Call & Chat Logs
  - Wallet Management
  - Withdrawal Requests
- Logout returns to Home page

---

## 🔐 SECURITY NOTES

- ✅ JWT tokens used for consultant authentication
- ✅ Passwords hashed in database
- ✅ No sensitive data in localStorage
- ✅ Backend validates all requests
- ✅ HTTPS recommended for production (ngrok provides HTTPS for dev)

---

## 📊 WHAT'S RUNNING

| Component | Location | Status |
|-----------|----------|--------|
| Backend API | http://localhost:3500 | Running ✅ |
| Frontend Build | http://localhost:8765 | Running ✅ |
| ngrok Tunnel | https://viewy-hyperintelligently-toshiko.ngrok-free.dev | Running ✅ |
| Wix Storefront | Your Wix site | Ready ✅ |
| Admin Dashboard | Separate (unchanged) | Unchanged ✅ |

---

## 🛠️ BUILD COMMAND

To rebuild Consultly after code changes:
```bash
cd wix-consultant-client
npm run build:consultly
# Output: build/ folder
```

Then restart http-server:
```bash
cd build
npx http-server -p 8765
```

---

## ✅ CHECKLIST BEFORE GOING LIVE

- [ ] Backend running on port 3500
- [ ] Frontend served on port 8765
- [ ] ngrok tunnel active at https://viewy-hyperintelligently-toshiko.ngrok-free.dev
- [ ] Wix "Consultly" navigation item added
- [ ] Menu shows: Home | Shop | Consultly | More
- [ ] Click "Consultly" loads React app
- [ ] React header shows: Home | Profile | Become a Consultant
- [ ] Consultant cards load (backend must have data)
- [ ] Profile shows "Login Required" if not logged in
- [ ] Consultant login works with valid credentials
- [ ] Dashboard loads full-screen (no Wix chrome)
- [ ] Logout returns to home

---

## 🎉 YOU'RE READY!

The Consultly React app is built and ready to deploy to your Wix storefront.

**Next Steps:**
1. Add "Consultly" navigation item in Wix Studio (follow steps above)
2. Test in your live Wix storefront
3. When ready for production, deploy `build/` to permanent hosting and update ngrok URL in Wix

**Admin Dashboard:** Unchanged and still works as before! ✅
