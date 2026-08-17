# Wix Integration Environment Configuration

This document outlines all environment variables required for the Wix widget integration.

## Frontend Environment Variables (.env)

```
# Backend API Configuration
REACT_APP_BACKEND_HOST=https://your-backend-domain.com
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com

# Wix Site Configuration (production only)
REACT_APP_WIX_SITE_ORIGIN=https://your-wix-site.com

# Firebase Configuration (existing)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
REACT_APP_FIREBASE_VAPID_KEY=...

# Agora Configuration (existing)
REACT_APP_AGORA_APP_ID=...
```

## Backend Environment Variables (.env)

The backend already has most configurations. Ensure these are set:

```
# MongoDB
MONGO_DB_URL=mongodb+srv://...

# Server Configuration
MVC_BACKEND_PORT=3500
NODE_ENV=development|production

# Authentication
JWT_SECRET_KEY=your-secret-key
PASSWORD_SECRECT_ROUNDING=10

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-wix-site.com,https://your-frontend-domain.com

# Frontend URLs for redirects
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com
WIX_DASHBOARD_URL=https://your-frontend-domain.com/dashboard

# Wix App Credentials (from Wix Dev Center)
WIX_CLIENT_ID=your-wix-client-id
WIX_CLIENT_SECRET=your-wix-client-secret

# Agora Configuration
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Stripe Configuration (if using payments)
STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID_BASIC=...
STRIPE_WEBHOOK_SECRET=...
```

## Development Setup (ngrok)

For local development with ngrok:

### 1. Start Backend
```bash
cd wix-consultant-backend
npm run dev
```

### 2. Get ngrok URL
```bash
ngrok http 3500
```

### 3. Update Frontend .env
```
REACT_APP_BACKEND_HOST=https://your-ngrok-url.ngrok-free.dev
REACT_APP_FRONTEND_URL=https://your-ngrok-url.ngrok-free.dev
```

### 4. Start Frontend
```bash
cd wix-consultant-client
npm start
```

## Production Setup

### Frontend Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Update environment variables:
```
REACT_APP_BACKEND_HOST=https://your-production-api.com
REACT_APP_FRONTEND_URL=https://your-production-frontend.com
REACT_APP_WIX_SITE_ORIGIN=https://your-wix-site.com
NODE_ENV=production
```

3. Deploy to Vercel, Netlify, or your hosting provider

### Backend Deployment

1. Set production environment variables
2. Update CORS configuration with production origins
3. Deploy to your server/platform

## Wix Configuration

### Wix Site Widget Setup

1. Go to **Wix Dev Center** → Your App
2. In **App Settings**, add your widget:
   - **Element Tag Name**: `consultant-widget`
   - **Component URL**: `https://your-production-frontend.com/widget.js`

### Wix Page Configuration

1. Create/Edit a Wix page where you want the widget
2. Add the widget to the page
3. Configure widget settings (if applicable)
4. Set Wix origin parameters for security

## Security Considerations

### Never do this:
- ❌ Hard-code secrets in frontend code
- ❌ Expose access tokens in query parameters
- ❌ Use `Access-Control-Allow-Origin: *` for authenticated APIs
- ❌ Trust all origins in postMessage communication

### Always do this:
- ✅ Store secrets in backend .env files
- ✅ Validate postMessage origins
- ✅ Use explicit allowed origins in CORS
- ✅ Use HTTPS in production
- ✅ Validate tokens server-side

## Troubleshooting

### Widget not loading
- Check `REACT_APP_BACKEND_HOST` is accessible from Wix
- Verify CORS configuration allows Wix origins
- Check browser console for errors

### Authentication fails
- Verify `JWT_SECRET_KEY` matches between builds
- Check token not expired
- Verify localStorage access (not blocked by browser)

### Iframe sizing issues
- Check `wixResize.js` measurements
- Verify no hardcoded heights blocking content
- Check browser console for ResizeObserver errors

### postMessage origin blocked
- Verify origin in `wixEnvironment.js` patterns
- Check `REACT_APP_WIX_SITE_ORIGIN` in production
- Review origin validation logic in `wixBridge.js`
