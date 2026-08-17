# Quick Start Guide - Wix Integration

Copy-paste ready commands and configurations for getting started.

## Local Development (5 minutes)

### Terminal 1: Backend
```bash
cd wix-consultant-backend
npm install  # First time only
npm run dev
# Output: Server running on port 3500
```

### Terminal 2: Frontend
```bash
cd wix-consultant-client
npm install  # First time only
npm start
# Opens http://localhost:3000 in browser
```

### Terminal 3: ngrok Tunnel
```bash
ngrok http 3000
# Copy URL: https://abc123.ngrok-free.dev
```

### Update Frontend .env
```bash
# wix-consultant-client/.env
REACT_APP_BACKEND_HOST=https://abc123.ngrok-free.dev
REACT_APP_FRONTEND_URL=https://abc123.ngrok-free.dev
```

### Test
Visit: `https://abc123.ngrok-free.dev/consultant/card`

---

## Production Deployment

### 1. Build
```bash
cd wix-consultant-client
npm run build
```

### 2. Deploy Frontend
**Vercel:**
```bash
npm install -g vercel
vercel --prod
# Get URL: https://your-app.vercel.app
```

**Self-hosted:**
```bash
# Upload build/ folder to your server
# Configure for SPA routing (redirect 404 to index.html)
```

### 3. Update Environment
```bash
# .env files
REACT_APP_BACKEND_HOST=https://your-api.com
REACT_APP_FRONTEND_URL=https://your-app.com
REACT_APP_WIX_SITE_ORIGIN=https://your-site.wixsite.com
```

### 4. Register Wix App
1. Go to https://dev.wix.com
2. Create new "Site Widget" app
3. Set Component URL: `https://your-app.com/index.html`
4. Set Element Tag: `consultant-widget`

### 5. Add to Wix Page
1. Edit Wix page
2. Add element → Search "Consultant Marketplace"
3. Add widget
4. Set width to 100%
5. Publish

---

## Environment Variables Checklist

### Frontend (.env)
```
REACT_APP_BACKEND_HOST=https://your-backend.com
REACT_APP_FRONTEND_URL=https://your-frontend.com
REACT_APP_WIX_SITE_ORIGIN=https://your-site.wixsite.com
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_AGORA_APP_ID=...
```

### Backend (.env)
```
MONGO_DB_URL=mongodb+srv://...
MVC_BACKEND_PORT=3500
JWT_SECRET_KEY=your-secret-key
CORS_ALLOWED_ORIGINS=https://your-site.wixsite.com,https://your-backend.com
AGORA_APP_ID=...
FIREBASE_SERVICE_ACCOUNT=...
```

---

## File Organization

### New Files Created:
```
src/integrations/wix/
├── index.js
├── wixEnvironment.js       # Config & validation
├── wixBridge.js            # Communication
├── wixWidgetModes.js       # Mode switching
└── wixResize.js            # Responsive sizing

src/components/WidgetHeader/
├── ApplicationHeader.js     # Main header component
└── ApplicationHeader.css    # Styling

Documentation/
├── WIX_IMPLEMENTATION_SUMMARY.md
├── WIX_SETUP_GUIDE.md
├── WIX_TESTING_CHECKLIST.md
├── WIX_INTEGRATION_ENV.md
└── QUICK_START.md (this file)
```

### Modified Files:
```
src/App.js  # Added Wix initialization
```

---

## Navigation Flow

### Guest/Customer
```
Home → [Our Consultants] → View Consultant → Profile → [Become a Consultant]
                                                              ↓
                                                           Login Form
```

### After Login (Consultant)
```
Dashboard (Full screen, Wix shell hidden)
├── Chats
├── Calls
├── Earnings
├── Profile
└── [Logout] → Back to Home
```

---

## Testing Critical Paths

### Path 1: Storefront
- [ ] Load `/consultant/card`
- [ ] See consultant listing
- [ ] Click consultant card
- [ ] View consultant profile
- [ ] Application header works
- [ ] Navigation works

### Path 2: Authentication
- [ ] Click "Become a Consultant"
- [ ] Fill email, password
- [ ] Submit login
- [ ] See dashboard

### Path 3: Dashboard
- [ ] Wix header hidden
- [ ] Wix footer hidden
- [ ] Dashboard fills viewport
- [ ] Can navigate tabs
- [ ] No double scrollbar
- [ ] Height responsive

### Path 4: Logout
- [ ] Click logout button
- [ ] Return to storefront
- [ ] Wix shell visible
- [ ] Can login again

---

## Console Debug Commands

```javascript
// Verify Wix bridge initialized
window.wixBridge

// Check current mode
window.widgetModeManager?.getMode()  // "storefront" or "dashboard"

// Check resizer running
window.wixResizer?.isActive

// Force height update
window.wixResizer?.measure()

// Check localStorage
localStorage.getItem('consultant_logged_in')
localStorage.getItem('token')

// Test postMessage to parent
window.parent.postMessage({ type: 'TEST' }, '*')
```

---

## Common Errors & Fixes

### Error: "CORS blocked"
**Fix:**
```bash
# Update backend .env
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### Error: "Widget not loading"
**Fix:**
```bash
# Verify backend running
curl https://your-backend.com/api/health

# Check frontend URL correct
# Check ngrok tunnel active
```

### Error: "Wix shell not hiding"
**Fix:**
```javascript
// In console:
window.widgetModeManager?.setMode('dashboard')
```

### Error: "Double scrollbar"
**Fix:**
- Check iframe height calculation
- Verify content not overflow-hidden
- Check CSS for fixed container heights

---

## Performance Checklist

- [ ] Initial load < 3 seconds
- [ ] Dashboard load < 2 seconds
- [ ] No janky scrolling
- [ ] No console warnings
- [ ] Lighthouse score > 90
- [ ] No memory leaks

```bash
# Check with Lighthouse (Chrome DevTools)
# Run audit for mobile and desktop
# Target: 90+ score all categories
```

---

## Security Checklist

- [ ] No tokens in URL
- [ ] postMessage origins validated
- [ ] HTTPS enabled
- [ ] CORS not using *
- [ ] Backend validates tokens
- [ ] Environment secrets in .env
- [ ] No secrets in code

---

## Deployment Checklist

### Before Production
- [ ] All environment variables set
- [ ] Backend running and tested
- [ ] Frontend built and deployed
- [ ] CORS configured
- [ ] Wix app registered
- [ ] Widget added to page
- [ ] Testing checklist passed

### After Launch
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Monitor user feedback
- [ ] Check CORS is not blocking
- [ ] Verify tokens working

---

## Need Help?

### Setup Issues
→ See `WIX_SETUP_GUIDE.md`

### Environment Questions
→ See `WIX_INTEGRATION_ENV.md`

### Testing Questions
→ See `WIX_TESTING_CHECKLIST.md`

### Architecture Details
→ See `WIX_IMPLEMENTATION_SUMMARY.md`

### Code Questions
→ Check inline comments in code files

---

## Key Concepts

**STOREFRONT MODE**
- Normal view with Wix header/footer
- Shows consultant listing and profile
- Login/registration access
- Responsive height

**DASHBOARD MODE**
- Full screen, Wix shell hidden
- For logged-in consultants only
- Available after successful login
- No exit without logout

**Wix Bridge**
- Secure communication with parent Wix page
- Origin validation on all messages
- Never sends tokens or secrets
- Coordinates mode changes

**Widget Resizer**
- Calculates content height
- Sends to Wix parent
- Debounced (not every pixel change)
- Mode-specific calculations

---

## Support Commands

```bash
# Health check backend
curl https://your-backend.com/api/health

# Test CORS from your frontend origin
curl -H "Origin: https://your-frontend.com" \
  https://your-backend.com/api/health \
  -v

# Check if port is in use
lsof -i :3000  # Frontend
lsof -i :3500  # Backend

# Kill process on port (if needed)
kill -9 $(lsof -t -i :3000)  # macOS/Linux
# Windows: Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

## Production Monitoring

```javascript
// Add to your monitoring service (Sentry, LogRocket, etc.)
if (window.wixBridge) {
  // Track Wix integration
  console.log('Wix integration active');
  // Send to monitoring
}

// Log errors
window.addEventListener('error', (event) => {
  console.error('Runtime error:', event.error);
  // Send to monitoring
});
```

---

## Next Week Agenda

- **Day 1-2:** Setup and local testing
- **Day 3-4:** Deploy to staging
- **Day 5:** Final testing and bug fixes
- **Week 2:** Production deployment
- **Week 3:** Monitor and gather feedback

---

## Timeline Estimate

| Task | Time |
|------|------|
| Setup local dev | 15 min |
| Local testing | 1 hour |
| Deploy frontend | 30 min |
| Deploy backend | 30 min |
| Wix app registration | 15 min |
| Wix page setup | 30 min |
| Integration testing | 2 hours |
| **Total** | **~5 hours** |

---

## Done! 🎉

You now have a fully integrated Wix consultant marketplace widget.

Next: Follow `WIX_SETUP_GUIDE.md` for detailed deployment steps.
