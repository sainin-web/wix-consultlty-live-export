# QUICK REFERENCE CARD

**Print this or bookmark it!**

---

## **3 RUNNING PROCESSES:**

```bash
# Terminal 1: Backend (Port 6060)
cd wix-consultant-backend && npm start

# Terminal 2: Frontend (Port 3000)
cd wix-consultant-client && npm start

# Terminal 3: ngrok (Exposes 3000)
ngrok http 3000
```

---

## **3 WIXPAGES:**

| Page | URL | Component | Status |
|------|-----|-----------|--------|
| Our Consultant | /consultant/card | Marketplace | iFrame ✅ |
| Become Consultant | /login | Login Form | iFrame ✅ |
| My Profile | /profile | Profile | iFrame ✅ |
| **Dashboard** | **/consultant-dashboard** | **Full Screen** | **FULL SCREEN ❌ NO FRAME** |

---

## **KEY URLs:**

```
Frontend:        http://localhost:3000
Backend:         http://localhost:6060 (wait, check output)
ngrok:           https://viewy-hyperintelligently-toshiko.ngrok-free.dev
Backend API:     https://test-wix-consultant.zend-apps.com
```

---

## **LOGIN FLOW:**

```
Wix Page (/login) 
  ↓ (iframe)
React Login Form
  ↓ (user enters email/password)
POST /api/consultant/login
  ↓ (backend validates)
Returns JWT token
  ↓ (stored in localStorage)
Redirect to /consultant-dashboard
  ↓
FULL SCREEN DASHBOARD (no Wix frame)
```

---

## **WHAT EACH PAGE SHOWS:**

### **In Wix iFrame (Wix header/footer visible):**
```
┌─────────────────────────┐
│   WIX HEADER            │
├─────────────────────────┤
│  React Page Content     │
│  (Marketplace/Login)    │
├─────────────────────────┤
│   WIX FOOTER            │
└─────────────────────────┘
```

### **Consultant Dashboard (Full Screen, NO Wix):**
```
┌─────────────────────────┐
│   React Dashboard       │
│   ├─ Sidebar            │
│   ├─ Main Content       │
│   └─ Tabs/Navigation    │
│                         │
│   (NO Wix header/footer)│
└─────────────────────────┘
```

---

## **TROUBLESHOOTING:**

### **Problem: Page won't load**
```
Check:
1. Is backend running? (Terminal 1)
2. Is frontend running? (Terminal 2)
3. Is ngrok running? (Terminal 3)
4. Is ngrok URL correct in Wix?
5. Check browser console for errors
```

### **Problem: Login fails**
```
Check:
1. Backend /api/consultant/login responding?
   curl -X POST http://localhost:6060/api/consultant/login
2. Email/password correct?
3. CORS configured?
   Backend .env: CORS_ALLOWED_ORIGINS
4. Check backend logs for errors
```

### **Problem: CORS errors**
```
Fix:
1. Update backend/.env:
   CORS_ALLOWED_ORIGINS=https://viewy-hyperintelligently-toshiko.ngrok-free.dev,http://localhost:3000,https://test-wix-consultant.zend-apps.com
   CORS_CREDENTIALS=true

2. Restart backend
3. Refresh browser
```

### **Problem: Dashboard not loading**
```
Check:
1. Is user logged in? (Check localStorage)
2. Does token exist in console:
   localStorage.getItem('token')
3. Is /consultant-dashboard route protected?
4. Check browser console for auth errors
```

### **Problem: Wix header/footer showing on dashboard**
```
This is WRONG! Should only be on login page.

Expected:
- /login page → iFrame (header/footer visible)
- /consultant-dashboard → Full screen (NO frame)

If both have frames:
- Check that you removed StorefrontShell wrapper
- App.js line ~355 should NOT have <StorefrontShell>
- Should just be <TabNavigation />
```

---

## **IMPORTANT FILES:**

```
Frontend:
├── src/App.js ..................... Main routing
├── src/index.js ................... Entry point
├── src/pages/ConsultantDashboard .. Dashboard component
└── src/components/ConsultantDashboard/TabNavigation.jsx

Backend:
├── .env ........................... Configuration
├── index.js ....................... Server entry
└── Routes/              .......... API routes

Wix:
├── Page 1: Our Consultant page
├── Page 2: Become Consultant page
├── Page 3: My Profile page
└── HTML Embed elements (with iframe code)
```

---

## **ENVIRONMENT VARIABLES:**

### **Frontend (.env or .env.local):**
```
REACT_APP_BACKEND_HOST=https://test-wix-consultant.zend-apps.com
REACT_APP_FRONTEND_URL=https://viewy-hyperintelligently-toshiko.ngrok-free.dev
```

### **Backend (.env):**
```
CORS_ALLOWED_ORIGINS=https://viewy-hyperintelligently-toshiko.ngrok-free.dev,http://localhost:3000,https://test-wix-consultant.zend-apps.com
CORS_CREDENTIALS=true
MVC_BACKEND_PORT=6060
```

---

## **COMMANDS CHEATSHEET:**

```bash
# Check if backend running
curl http://localhost:6060/api/storefront/consultants

# Check if frontend running
curl http://localhost:3000

# Check ngrok status
# Should see: Forwarding https://... -> http://localhost:3000

# Test login API
curl -X POST http://localhost:6060/api/consultant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check localStorage (in browser console)
localStorage.getItem('token')
localStorage.getItem('consultant_logged_in')

# Clear localStorage (if testing)
localStorage.clear()
location.reload()
```

---

## **CHECKLIST BEFORE GOING LIVE:**

- [ ] All 3 terminals running (backend, frontend, ngrok)
- [ ] All 3 Wix pages created (Our Consultant, Become Consultant, My Profile)
- [ ] All 3 pages have iFrame code embedded
- [ ] Backend CORS configured
- [ ] Login test successful
- [ ] Dashboard loads after login
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Wix header/footer visible on menu pages
- [ ] Wix header/footer HIDDEN on dashboard

---

## **NEXT STEPS:**

1. ✅ Code implementation done
2. ⏳ Start 3 terminals (backend, frontend, ngrok)
3. ⏳ Test in browser (localhost:3000)
4. ⏳ Create Wix pages (3 pages)
5. ⏳ Add iframe code to Wix pages
6. ⏳ Test in Wix preview
7. ⏳ Publish Wix site
8. ✅ DONE!

---

**Print or bookmark this!** 📋
