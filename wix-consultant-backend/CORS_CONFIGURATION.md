# CORS CONFIGURATION FOR WIX HYBRID ARCHITECTURE

This document explains how to configure CORS for the React apps deployed separately on Vercel.

## Current CORS Setup

The backend currently has some CORS configuration. For the Wix Hybrid Architecture, we need to update it to allow requests from:

1. **Storefront App** (deployed on Vercel)
2. **Consultant Portal** (deployed on Vercel)
3. **Customer Portal** (deployed on Vercel)
4. **Wix Domain** (optional, for direct API calls from Wix)

---

## Configuration by Environment

### Development (localhost)

```javascript
// backend/cors-config.js or in your main server file

const corsOptions = {
  origin: [
    'http://localhost:3000',        // React dev server
    'http://localhost:3001',        // Storefront dev
    'http://localhost:3002',        // Consultant dev
    'http://localhost:3003',        // Customer dev
    'http://localhost:3500',        // Backend dev
    'http://127.0.0.1:3000',
  ],
  credentials: true,                // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### Staging/Testing

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://storefront-staging.vercel.app',
    'https://consultant-staging.vercel.app',
    'https://customer-staging.vercel.app',
    'https://test-wix-consultant.zend-apps.com',  // Your Wix staging domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
```

### Production

```javascript
const corsOptions = {
  origin: [
    'https://storefront.vercel.app',        // Production Storefront
    'https://consultant.vercel.app',        // Production Consultant Portal
    'https://customer.vercel.app',          // Production Customer Portal
    'https://yourdomain.com',               // Your Wix domain
    'https://www.yourdomain.com',           // Wix domain with www
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
```

---

## Environment-Based Configuration

### Using Environment Variables

Update `.env` in backend:

```env
# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_HEADERS=Content-Type,Authorization
```

### Updated CORS Middleware

```javascript
// backend/MiddleWare/cors.js or middleware setup

const cors = require('cors');

const getCorsOptions = () => {
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
  
  return {
    origin: origins.map(o => o.trim()),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH').split(','),
    allowedHeaders: (process.env.CORS_HEADERS || 'Content-Type,Authorization').split(','),
    optionsSuccessStatus: 200,
  };
};

app.use(cors(getCorsOptions()));
```

---

## Vercel Deployment: Additional Headers

Add to `vercel.json` for each app:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://test-wix-consultant.zend-apps.com"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        }
      ]
    }
  ]
}
```

---

## API Endpoints by App

### Storefront App
```
GET /api/storefront/consultants          — Public (no auth)
GET /api/storefront/consultant/:id       — Public (no auth)
```

### Consultant Portal
```
POST /api/consultant/login               — Public
POST /api/consultant/register            — Public
GET  /api/consultant/dashboard           — Auth required
GET  /api/consultant/profile             — Auth required
PUT  /api/consultant/profile             — Auth required
GET  /api/consultant/earnings            — Auth required
GET  /api/consultant/calls               — Auth required
```

### Customer Portal
```
GET  /api/customer/profile               — Wix member auth required
PUT  /api/customer/profile               — Wix member auth required
GET  /api/customer/wallet                — Wix member auth required
GET  /api/customer/vouchers              — Wix member auth required
GET  /api/customer/history               — Wix member auth required
POST /api/customer/add-funds             — Wix member auth required
```

---

## Testing CORS Configuration

### Test with curl:

```bash
# Test storefront endpoint
curl -X GET \
  -H "Origin: https://storefront.vercel.app" \
  https://api.yourdomain.com/api/storefront/consultants

# Should return:
# Access-Control-Allow-Origin: https://storefront.vercel.app
# Access-Control-Allow-Credentials: true
```

### Test with browser console:

```javascript
// From browser console on deployed app
fetch('https://api.yourdomain.com/api/storefront/consultants', {
  method: 'GET',
  credentials: 'include',  // Include cookies
})
.then(r => r.json())
.then(data => console.log(data))
.catch(err => console.error('CORS Error:', err));
```

---

## Troubleshooting

### Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** Origin not in CORS allowlist

**Solution:**
1. Check request origin in browser console (Network tab)
2. Add it to CORS_ORIGINS in .env
3. Restart backend

### Error: "Credentials mode is 'include' but Access-Control-Allow-Credentials is missing"

**Cause:** `credentials: true` in fetch but CORS not allowing credentials

**Solution:**
1. Ensure `CORS_CREDENTIALS=true` in .env
2. Never use `Access-Control-Allow-Origin: *` with credentials
3. Always use specific origins

### Cookies Not Being Sent

**Cause:** Missing `SameSite` attribute or wrong domain

**Solution:**
```javascript
// In Express session config
app.use(session({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',         // Important for cross-domain
    secure: process.env.NODE_ENV === 'production',
    domain: '.yourdomain.com',  // Allows subdomains
  },
}));
```

---

## Security Best Practices

### ✅ DO:
- ✅ List specific origins (never use *)
- ✅ Use HTTPS in production
- ✅ Validate/validate all incoming data
- ✅ Use `sameSite: 'lax'` for cookies
- ✅ Keep credentials in secure httpOnly cookies
- ✅ Validate origin header on API calls

### ❌ DON'T:
- ❌ Use `Access-Control-Allow-Origin: *` with credentials
- ❌ Put tokens in URL query parameters
- ❌ Use `sameSite: 'none'` without HTTPS
- ❌ Trust origin header blindly
- ❌ Expose secrets in CORS headers

---

## Final Configuration Checklist

- [ ] Development origins configured (.env)
- [ ] Staging origins configured (.env)
- [ ] Production origins configured (.env)
- [ ] Credentials enabled for authenticated routes
- [ ] Cookies configured with proper sameSite
- [ ] API endpoints tested from deployed apps
- [ ] Error handling tested
- [ ] Cookies being sent correctly
- [ ] Authentication flow works end-to-end

---

## Quick Reference: Production Deployment

When deploying to Vercel, ensure backend .env has:

```env
NODE_ENV=production
CORS_ORIGINS=https://storefront-app.vercel.app,https://consultant-app.vercel.app,https://customer-app.vercel.app,https://yourdomain.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_HEADERS=Content-Type,Authorization
```

Then restart/redeploy backend server.
