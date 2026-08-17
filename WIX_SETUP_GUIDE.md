# Wix Integration Setup Guide

Complete step-by-step guide for setting up the React consultant marketplace in Wix.

## Architecture Overview

```
WIX WEBSITE (parent page)
├── Wix Native Header
├── Wix Native Footer
└── React Consultant Widget (iframe)
    ├── Application Header (custom)
    │   ├── Our Consultants
    │   ├── Profile
    │   └── Become a Consultant / Dashboard
    └── React Application Content
        ├── Storefront (Normal mode)
        ├── Dashboard (Full-screen mode - hides Wix shell)
        └── Profile & Auth
```

## Key Implementation Details

### Widget Modes

**STOREFRONT MODE:**
- Wix header visible
- Wix footer visible
- Application header visible
- Standard iframe height (responsive to content)
- Shows: Consultant listing, profile, login form

**DASHBOARD MODE:**
- Wix header hidden
- Wix footer hidden
- Application header hidden (consultant navigation in dashboard)
- Full viewport height
- Consultant dashboard occupies all available space

### Security Model

1. **Origin Validation**: All postMessage origins validated
2. **Token Storage**: JWT in localStorage (not URL)
3. **CORS**: Explicit origins allowed (not wildcards)
4. **CSP Headers**: Backend sends policy for frame embedding

## Step-by-Step Implementation

### Step 1: Prepare Environment Variables

**Create `wix-consultant-client/.env`:**

```
# Backend API Configuration
REACT_APP_BACKEND_HOST=https://your-backend-domain.com
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com

# Wix Site Configuration (for origin validation in production)
REACT_APP_WIX_SITE_ORIGIN=https://your-wix-site.com

# Keep existing Firebase configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyCi61pDIUtbi7pvnxfFRNIpi8RjTHpFNxs
REACT_APP_FIREBASE_AUTH_DOMAIN=consultant-app-24ceb.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=consultant-app-24ceb
REACT_APP_FIREBASE_STORAGE_BUCKET=consultant-app-24ceb.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=465295888006
REACT_APP_FIREBASE_APP_ID=1:465295888006:web:ae07e6f6667e0e6f838b07
REACT_APP_FIREBASE_MEASUREMENT_ID=G-9TD9Q1Q0PJ
REACT_APP_FIREBASE_VAPID_KEY=BB8E-fAs8w3xZZ3cL_R3jjnTHaNDu4LGcra1NJhX60UG0lxvzBHVzzblrvv7cm6FMaGo_o_r2hbiB1eibrtg1h0

# Agora Configuration
REACT_APP_AGORA_APP_ID=656422a01e774a4ba5b2dc0ac12e5fe5
```

**Verify `wix-consultant-backend/.env` includes:**

```
# Wix Site Origin (added to CORS_ALLOWED_ORIGINS)
CORS_ALLOWED_ORIGINS=https://your-wix-site.com,https://your-backend-domain.com

# Existing configurations should remain
MONGO_DB_URL=mongodb+srv://...
MVC_BACKEND_PORT=3500
JWT_SECRET_KEY=...
AGORA_APP_ID=...
FIREBASE_SERVICE_ACCOUNT=...
```

### Step 2: Build for Production

```bash
cd wix-consultant-client

# Install dependencies
npm install

# Production build
npm run build

# Built files are in ./build directory
```

### Step 3: Deploy Frontend

Choose one:

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
cd wix-consultant-client
vercel --prod

# Get your production URL
# Example: https://wix-consultant.vercel.app
```

**Option B: Self-hosted Server**
```bash
# Upload contents of `build/` folder to your web server
# Configure to serve index.html for all routes
# Example with nginx:
location / {
  try_files $uri $uri/ /index.html;
}
```

**Option C: ngrok (Development Only)**
```bash
cd wix-consultant-client
npm start

# In another terminal:
ngrok http 3000
# Gets URL like: https://abc123.ngrok-free.dev
```

### Step 4: Deploy Backend

**Backend should be running at:** `https://your-backend-domain.com`

```bash
cd wix-consultant-backend

# Start server
npm start
# or for development:
npm run dev
```

### Step 5: Verify API Connectivity

```bash
# Test backend is accessible
curl https://your-backend-domain.com/api/health

# Test CORS headers from frontend domain
curl -H "Origin: https://your-frontend-url" \
  https://your-backend-domain.com/api/health \
  -v
```

### Step 6: Wix App Registration

1. **Go to [Wix Dev Center](https://dev.wix.com)**

2. **Create New App:**
   - Click "Create App"
   - Select "Site Widget"
   - Fill in details:
     - App Name: "Consultant Marketplace"
     - Short Description: "Integrated consultant marketplace platform"
     - Developer: Your info

3. **Configure Widget:**
   - Go to "App Settings" → "Widget"
   - **Element Tag Name:** `consultant-widget`
   - **Component URL:** `https://your-frontend-url/index.html`
   - **Version:** `1.0.0`
   - Click "Save"

4. **Get OAuth Credentials** (for future Wix billing integration):
   - Go to "OAuth & Permissions"
   - Copy your `Client ID` and `Client Secret`
   - Add your domain to "Redirect URLs"

### Step 7: Create Wix Pages

In your Wix site:

**Page 1: Storefront Page**
- **Page Name:** "Consultants"
- **URL:** `/consultants`
- **Layout:** Full-width

**Page 2: Dashboard Page (Optional)**
- **Page Name:** "Consultant Dashboard"  
- **URL:** `/consultant-dashboard`
- **Layout:** Full-width
- *(You can add the same widget here OR handle mode switching on the same page)*

### Step 8: Add Widget to Wix Pages

On the "Consultants" Page:

1. **Open Page Editor** in Wix
2. **Add Element:**
   - Click "+" button
   - Search for your app name "Consultant Marketplace"
   - Click to add
3. **Resize Widget:**
   - Set Width: 100%
   - Let Height be Auto (JavaScript manages it)
4. **Publish Page**

### Step 9: Handle Wix User Authentication

Add this code to your Wix page:

**In Wix Page Code (Settings → Code):**

```javascript
// When Wix member logs in, send data to widget
import wix from 'wix-api';

$w.onReady(async function () {
  try {
    const member = await wix.members.currentMember.getMember();
    
    if (member.id) {
      // Wix user is logged in
      // Communicate with widget
      const widget = $w('#consultantWidget'); // or your widget selector
      
      // Send message to widget iframe
      window.addEventListener('message', (event) => {
        if (event.data.type === 'WIDGET_READY') {
          // Widget is ready, send user data
          event.source.postMessage({
            type: 'WIX_USER_DATA',
            wixMemberId: member.id,
            wixEmail: member.loginEmails[0] || member.email,
            wixName: member.profile.nickname || member.profile.firstName,
            wixPhoto: member.profile.photo,
          }, '*');
        }
      });
    }
  } catch (error) {
    console.error('Member fetch error:', error);
  }
});
```

### Step 10: Test Local Development

Before going live, test with ngrok:

```bash
# Terminal 1: Backend
cd wix-consultant-backend
npm run dev
# Runs on http://localhost:3500

# Terminal 2: Frontend  
cd wix-consultant-client
npm start
# Runs on http://localhost:3000

# Terminal 3: ngrok tunnel
ngrok http 3000
# Shows: https://xxxxx.ngrok-free.dev

# Terminal 4: ngrok tunnel for backend (optional)
ngrok http 3500
# Shows: https://yyyyy.ngrok-free.dev
```

**Update Frontend .env for local testing:**
```
REACT_APP_BACKEND_HOST=https://yyyyy.ngrok-free.dev
REACT_APP_FRONTEND_URL=https://xxxxx.ngrok-free.dev
```

**Update Wix Dev Center:**
- Set widget Component URL to: `https://xxxxx.ngrok-free.dev/index.html`

**Test in Wix Editor:**
1. Open your Wix site in editor
2. Go to Consultants page
3. You should see the widget loading
4. Test navigation and functionality

## File Changes Summary

### New Files Created:

```
src/
├── integrations/wix/
│   ├── index.js                     # Exports all Wix modules
│   ├── wixEnvironment.js            # Configuration & validation
│   ├── wixBridge.js                 # postMessage communication
│   ├── wixWidgetModes.js            # Mode management
│   └── wixResize.js                 # Responsive sizing
│
└── components/WidgetHeader/
    ├── ApplicationHeader.js          # Main app header
    └── ApplicationHeader.css         # Styling
```

### Modified Files:

```
src/App.js
├── Added Wix integration imports
├── Added Wix initialization hooks
├── Added Application Header component
├── Added mode management logic
└── Added iframe resizing

wix-consultant-client/.env
├── Updated REACT_APP_BACKEND_HOST
├── Updated REACT_APP_FRONTEND_URL
└── Added REACT_APP_WIX_SITE_ORIGIN

wix-consultant-backend/config/corsConfig.js
├── Already includes Wix origins
└── Verify your domain is in CORS_ALLOWED_ORIGINS
```

## Communication Protocol

The widget communicates with Wix using postMessage:

```javascript
// Widget → Wix (parent)
window.parent.postMessage({
  type: 'WIDGET_READY',           // Widget is initialized
  type: 'IFRAME_HEIGHT',          // Height changed
  type: 'REQUEST_DASHBOARD_MODE', // Enter dashboard mode
  type: 'EXIT_DASHBOARD_MODE',    // Exit dashboard mode
  type: 'CONSULTANT_LOGIN',       // Consultant logged in
  type: 'CONSULTANT_LOGOUT',      // Consultant logged out
}, targetOrigin);

// Wix → Widget (in iframe)
iframe.contentWindow.postMessage({
  type: 'WIX_USER_DATA',  // Send Wix member data
  wixMemberId: '...',
  wixEmail: '...',
}, '*');
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

The widget uses:
- Code splitting (lazy loading components)
- Route-level code splitting
- Debounced iframe resizing
- Lazy socket.io initialization
- Conditional component loading

Initial load should be <3 seconds for storefront.

## Security Considerations

✅ **Implemented:**
- Origin validation for postMessage
- CORS with explicit allowed origins
- CSP headers for frame embedding
- JWT token storage in localStorage
- Server-side token validation

⚠️ **Review These:**
- Backend environment variables (use .env, never commit)
- CORS_ALLOWED_ORIGINS matches your production domain
- JWT_SECRET_KEY is strong and random
- HTTPS enabled on all domains
- Wix app approved in Wix marketplace

## Monitoring & Maintenance

- Monitor API response times
- Check error logs regularly
- Update dependencies monthly
- Test after Wix platform updates
- Backup database regularly

## Rollback Plan

If issues occur:
1. Revert widget URL in Wix Dev Center
2. Revert frontend deployment
3. Check backend logs
4. Test locally with ngrok
5. Fix issues
6. Redeploy

## Next: Integration Checklist

See `WIX_INTEGRATION_CHECKLIST.md` for complete testing checklist.
