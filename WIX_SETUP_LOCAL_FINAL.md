# WIX HYBRID ARCHITECTURE — FINAL LOCAL SETUP

**Status:** ✅ Code Implementation Complete  
**Date:** 2026-08-14  
**Architecture:** Wix Hybrid (Native Header + iFrame + Full-Screen Dashboard)

---

## **FINAL STRUCTURE EXPLAINED:**

```
┌──────────────────────────────────────────────────────────┐
│              WIX WEBSITE (Header + Footer)               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Menu 1: "Our Consultant"                                │
│  ├─ URL: /our-consultant                                │
│  ├─ Wix iframe + React component                        │
│  ├─ Displays: Consultant marketplace                    │
│  └─ Wix header/footer visible ✅                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Menu 2: "Become Consultant"                             │
│  ├─ URL: /login                                         │
│  ├─ Wix iframe + React component                        │
│  ├─ Displays: Login form                                │
│  └─ Wix header/footer visible ✅                        │
│                                                          │
│  AFTER LOGIN ⬇️                                          │
│  ├─ Redirects to: /consultant-dashboard                 │
│  ├─ FULL SCREEN (no Wix frame)                          │
│  ├─ Displays: Consultant dashboard                      │
│  └─ Wix header/footer HIDDEN ❌                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Menu 3: "My Profile"                                    │
│  ├─ URL: /profile                                       │
│  ├─ Wix iframe + React component                        │
│  ├─ Displays: Customer profile                          │
│  └─ Wix header/footer visible ✅                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## **CHANGES MADE:**

### 1. **App.js Updated**
- ✅ Removed `StorefrontShell` wrapper from `/consultant-dashboard`
- ✅ Now renders full-screen (no Wix frame)
- ✅ Improved auth guard logic with better debug logs
- ✅ Proper redirect on login

### 2. **Route Structure**

| Route | Component | Wix Frame | Header/Footer |
|-------|-----------|-----------|---------------|
| `/consultant/card` | Our Consultant | ✅ Inside iFrame | ✅ Visible |
| `/login` | Consultant Login | ✅ Inside iFrame | ✅ Visible |
| `/consultant-dashboard` | Dashboard | ❌ Full Screen | ❌ Hidden |
| `/profile` | My Profile | ✅ Inside iFrame | ✅ Visible |
| `/admin` | Admin Panel | ✅ Inside iFrame | ✅ Visible |

---

## **STEP-BY-STEP LOCAL TESTING (5 DAYS):**

### **DAY 1: Start Frontend + Backend + ngrok**

#### Terminal 1: Backend
```bash
cd wix-consultant-backend
npm start
# Should start on port 6060
# Output: "Server running on port 6060"
```

#### Terminal 2: Frontend
```bash
cd wix-consultant-client
npm start
# Should start on localhost:3000
# Automatically opens browser
```

#### Terminal 3: ngrok
```bash
ngrok http 3000
# Output:
# Forwarding    https://viewy-hyperintelligently-toshiko.ngrok-free.dev -> http://localhost:3000
# (This is your ngrok URL)
```

#### Terminal 4: Monitor logs
```bash
# Keep this open to see console logs
# Both frontend and backend logs visible
```

---

### **DAY 2: Test All Pages Locally**

Visit in browser:

```
1. Our Consultant Marketplace:
   http://localhost:3000/consultant/card
   ✅ Should show consultant list
   ✅ No errors

2. Consultant Login Form:
   http://localhost:3000/login
   ✅ Should show email + password fields
   ✅ Should show login button

3. Login Test:
   - Enter consultant email: test@consultant.com
   - Enter password: password
   - Click login
   ✅ Should succeed
   ✅ Should redirect to /consultant-dashboard

4. Consultant Dashboard:
   http://localhost:3000/consultant-dashboard
   ✅ Should show full-screen dashboard
   ✅ Should have sidebar navigation
   ✅ Should have earnings, profile, etc

5. Customer Profile:
   http://localhost:3000/profile
   ✅ Should show profile page
   ✅ Should show wallet, vouchers, history

6. Check Browser Console:
   ✅ No errors
   ✅ No CORS warnings
   ✅ No 404s
```

---

### **DAY 3: Setup Wix Pages**

#### Page 1: "Our Consultant" (Public)

1. Open Wix Studio
2. Create new page: "Our Consultant"
3. Set visibility: Public
4. Add to menu
5. Add HTML Embed with:

```html
<div style="width: 100%; height: 100vh; margin: 0; padding: 0;">
  <iframe
    id="our-consultant-iframe"
    src="https://viewy-hyperintelligently-toshiko.ngrok-free.dev/consultant/card"
    style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;"
    frameborder="0"
    allow="camera; microphone; clipboard-read; clipboard-write"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
    title="Consultant Marketplace"
  ></iframe>
</div>

<script>
// Handle iframe resizing
window.addEventListener('message', (event) => {
  if (!event.data?.type) return;
  
  const iframe = document.getElementById('our-consultant-iframe');
  if (!iframe) return;
  
  if (event.data.type === 'RESIZE_IFRAME') {
    iframe.style.height = event.data.height + 'px';
  }
});
</script>
```

6. Preview
7. ✅ Should show marketplace

---

#### Page 2: "Become Consultant" (Login)

1. Create new page: "Become Consultant"
2. Set visibility: Public
3. Add to menu
4. Add HTML Embed with:

```html
<div style="width: 100%; height: 100vh; margin: 0; padding: 0;">
  <iframe
    id="consultant-login-iframe"
    src="https://viewy-hyperintelligently-toshiko.ngrok-free.dev/login"
    style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;"
    frameborder="0"
    allow="camera; microphone; clipboard-read; clipboard-write"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
    title="Consultant Login"
  ></iframe>
</div>

<script>
window.addEventListener('message', (event) => {
  if (!event.data?.type) return;
  
  const iframe = document.getElementById('consultant-login-iframe');
  if (!iframe) return;
  
  if (event.data.type === 'RESIZE_IFRAME') {
    iframe.style.height = event.data.height + 'px';
  }
});
</script>
```

5. Preview
6. ✅ Should show login form

---

#### Page 3: "My Profile" (Customer)

1. Create new page: "My Profile"
2. Set visibility: Members Only (important!)
3. Add to menu
4. Add HTML Embed with:

```html
<div style="width: 100%; height: 100vh; margin: 0; padding: 0;">
  <iframe
    id="customer-profile-iframe"
    src="https://viewy-hyperintelligently-toshiko.ngrok-free.dev/profile"
    style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;"
    frameborder="0"
    allow="camera; microphone; clipboard-read; clipboard-write"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
    title="My Profile"
  ></iframe>
</div>

<script>
window.addEventListener('message', (event) => {
  if (!event.data?.type) return;
  
  const iframe = document.getElementById('customer-profile-iframe');
  if (!iframe) return;
  
  if (event.data.type === 'RESIZE_IFRAME') {
    iframe.style.height = event.data.height + 'px';
  }
});
</script>
```

5. Preview
6. ✅ Should show profile page

---

### **DAY 4: Test Wix Integration**

1. Open Wix site in preview
2. Click "Our Consultant" menu
   - ✅ Marketplace loads in iframe
   - ✅ Wix header/footer visible
   - ✅ Can browse consultants
3. Click "Become Consultant" menu
   - ✅ Login form loads in iframe
   - ✅ Wix header/footer visible
   - ✅ Email/password fields visible
4. Login with consultant credentials
   - ✅ Form submits
   - ✅ Should redirect to /consultant-dashboard
   - ⚠️ **Important:** Dashboard may open in NEW TAB
   - ⚠️ OR may show full-screen overlay
5. Check Consultant Dashboard
   - ✅ Full-screen (no Wix header/footer)
   - ✅ Sidebar visible
   - ✅ Can navigate between tabs
6. Click "My Profile" menu
   - ✅ Profile loads in iframe
   - ✅ Wix header/footer visible

---

### **DAY 5: Fix Any Issues + Final Test**

#### If Login not redirecting:
```bash
# Check browser console for errors
# Check Redux state in DevTools
# Verify localStorage has token
# Verify backend /api/consultant/login working
```

#### If Dashboard not loading:
```bash
# Dashboard may open in same tab or new window
# Check browser console for errors
# Verify auth token in localStorage
# Test direct URL: /consultant-dashboard
```

#### If CORS errors:
```bash
# Backend .env must have:
CORS_ALLOWED_ORIGINS=https://viewy-hyperintelligently-toshiko.ngrok-free.dev,http://localhost:3000,https://test-wix-consultant.zend-apps.com
CORS_CREDENTIALS=true

# Restart backend after changes
```

---

## **IMPORTANT NOTES:**

### **Login to Dashboard Flow:**

The flow is designed as:

```
1. User on Wix page (/login)
2. Sees login form in iframe
3. Enters credentials
4. Form submits
5. Backend validates
6. Frontend receives token
7. Stores in localStorage
8. Redirects to /consultant-dashboard
9. Because URL changed, iframe navigates OR
10. New window opens (depends on configuration)
11. Dashboard renders FULL SCREEN (no Wix)
```

### **If You Want Same-Window Redirect:**

In LoginForm.jsx, after successful login:

```javascript
// Option A: Same window (iframe navigates)
window.location.href = '/consultant-dashboard';

// Option B: New window (dashboard separate)
window.open('/consultant-dashboard', '_blank');

// Option C: Parent window (escape iframe)
window.parent.location.href = '/consultant-dashboard';
```

---

## **TESTING CHECKLIST:**

### **Frontend Works:**
- [ ] http://localhost:3000/consultant/card loads
- [ ] http://localhost:3000/login loads
- [ ] http://localhost:3000/consultant-dashboard loads (after login)
- [ ] http://localhost:3000/profile loads
- [ ] No console errors

### **Backend Works:**
- [ ] POST /api/consultant/login succeeds
- [ ] GET /api/storefront/consultants returns data
- [ ] CORS headers present
- [ ] No 500 errors

### **ngrok Works:**
- [ ] https://viewy-hyperintelligently-toshiko.ngrok-free.dev loads in browser
- [ ] All routes work through ngrok URL
- [ ] No "Bad Gateway" errors

### **Wix Integration Works:**
- [ ] "Our Consultant" page loads
- [ ] "Become Consultant" page loads
- [ ] "My Profile" page loads (requires login)
- [ ] Header/footer visible on menu pages
- [ ] Header/footer hidden on dashboard

---

## **COMMANDS TO REMEMBER:**

```bash
# Terminal 1: Backend
cd wix-consultant-backend && npm start

# Terminal 2: Frontend
cd wix-consultant-client && npm start

# Terminal 3: ngrok
ngrok http 3000

# Terminal 4: Optional - Monitor logs
tail -f backend.log

# Test endpoints:
curl http://localhost:3500/api/storefront/consultants
curl -X POST http://localhost:3500/api/consultant/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'
```

---

## **FINAL STATUS:**

✅ **Frontend:** Ready (App.js updated)
✅ **Backend:** Ready (already running)
✅ **ngrok:** Ready (expose localhost)
✅ **Wix:** Ready (pages to create)
✅ **Documentation:** Complete

---

**Next Step:** Start DAY 1 and follow the plan! 🚀

All code is ready. Just run it! 💪
