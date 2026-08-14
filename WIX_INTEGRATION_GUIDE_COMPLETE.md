# WIX INTEGRATION GUIDE - PROPER IMPLEMENTATION

**Date:** 2026-08-13  
**Status:** Integration Guide  
**Apps to Integrate:** 3 (Storefront, Consultant Portal, Customer Portal)

---

## CURRENT STATE

### What We Have
✅ 3 Independent React apps built  
✅ Custom element approach (ConsultantWidget)  
✅ Wix OAuth/auth integration  
✅ Backend APIs ready  

### Current Issues
❌ All apps load from same monolithic bundle  
❌ No proper app separation in Wix  
❌ Widget approach not scalable for 3 apps  
❌ No clear routing between experiences  

---

## RECOMMENDED APPROACH: PROPER WIX INTEGRATION

### Architecture Overview

```
WIX SITE MENU
│
├── Home (native Wix page)
├── Shop (native Wix page)
├── Our Consultants (Wix Page + Storefront App)
│   └── Embedded: storefront-marketplace widget
├── Become a Consultant (Wix Page + Consultant App)
│   └── Embedded: consultant-portal widget
├── My Profile/Member (Wix Page + Customer App)
│   └── Embedded: customer-portal widget
└── More (native Wix pages)

WIX DASHBOARD
└── Admin Dashboard (Wix Dashboard extension)
```

---

## IMPLEMENTATION PLAN

### OPTION 1: CUSTOM WIDGETS (Current Approach - NOT Recommended)

**Pros:**
- Wix integrates via custom HTML elements
- Real-time data via attributes
- Wix authentication native

**Cons:**
- ❌ Heavy for Wix (loads 2MB React apps)
- ❌ All code in one bundle
- ❌ Not scalable
- ❌ Poor performance

**Implementation:**
```html
<!-- Our Consultants Page (Wix) -->
<storefront-marketplace instance="..." />

<!-- Become Consultant Page (Wix) -->
<consultant-portal instance="..." />

<!-- My Profile Page (Wix) -->
<customer-portal instance="..." />
```

---

### OPTION 2: SEPARATE HOSTED APPS (Recommended ⭐)

**Pros:**
- ✅ Each app is independent
- ✅ Faster loading
- ✅ Can scale separately
- ✅ Better performance
- ✅ Professional approach

**Cons:**
- Requires separate hosting
- CORS configuration needed
- Wix iframe integration

**Implementation:**

#### A. Host Apps Separately

```
Deploy to:
- Storefront: https://cdn.yourdomain.com/storefront/
- Consultant: https://cdn.yourdomain.com/consultant/
- Customer: https://cdn.yourdomain.com/customer/

Or use:
- Vercel (free tier)
- Netlify (free tier)
- AWS S3 + CloudFront
- Your own server
```

#### B. Wix Page Configuration

**Our Consultants Page:**
```
1. Create Wix Page "Our Consultants"
2. Add HTML Embed component
3. Paste: <iframe src="https://cdn.yourdomain.com/storefront/" />
4. Style to full page
5. Hide Wix header/footer if needed
```

**Become a Consultant Page:**
```
1. Create Wix Page "Become a Consultant"
2. Add HTML Embed component
3. Paste: <iframe src="https://cdn.yourdomain.com/consultant/" />
4. Style to full page
```

**My Profile Page:**
```
1. Create Wix Page "My Profile"
2. Add HTML Embed component
3. Paste: <iframe src="https://cdn.yourdomain.com/customer/" />
4. Style to full page
5. Show only for logged-in members
```

---

### OPTION 3: HYBRID APPROACH (Best Professional Solution ⭐⭐)

**Combine Wix Native + React Apps**

```
WIX SITE HEADER/FOOTER
│
├── Wix Native Pages
│   ├── Home
│   ├── Shop
│   └── More
│
└── React Apps (Embedded)
    ├── Our Consultants (Storefront)
    ├── Become a Consultant (Consultant Portal)
    └── My Profile (Customer Portal)
```

**Implementation:**

1. **Keep Wix header/footer native**
   - Professional branding
   - Consistent navigation
   - Better SEO

2. **Embed React apps as content**
   - Main content area only
   - Full-screen experience
   - App handles its own routing

3. **Use Wix API for data**
   - Auth: Use Wix member auth
   - Data: Sync with Wix via API
   - Members: Respect Wix member status

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Prepare Hosting

**Option A: Free Hosting (Vercel)**

```bash
# Deploy Storefront
cd wix-consultant-client/src/apps/storefront
npm run build
# Deploy build/ to Vercel
# URL: https://storefront-app.vercel.app

# Deploy Consultant
cd wix-consultant-client/src/apps/consultant
npm run build
# Deploy build/ to Vercel
# URL: https://consultant-app.vercel.app

# Deploy Customer
cd wix-consultant-client/src/apps/customer
npm run build
# Deploy build/ to Vercel
# URL: https://customer-app.vercel.app
```

**Option B: Self-hosted**

```bash
# Build all apps
npm run build:storefront
npm run build:consultant
npm run build:customer

# Upload to your server:
# /storefront/
# /consultant/
# /customer/

# URLs:
# https://yourdomain.com/storefront/
# https://yourdomain.com/consultant/
# https://yourdomain.com/customer/
```

---

### STEP 2: Wix Page Setup

#### Page 1: Our Consultants (Public)

```
Wix Editor:
1. Add new page "Our Consultants"
2. Remove default page elements
3. Add HTML Embed:
   <iframe 
     id="storefront"
     src="https://your-app-url.vercel.app/storefront/"
     style="width:100%;height:100%;border:none;"
   />
4. Make full-width, full-height
5. No login required (public)
```

#### Page 2: Become a Consultant (Public → Auth)

```
Wix Editor:
1. Add new page "Become a Consultant"
2. Remove default page elements
3. Add HTML Embed:
   <iframe 
     id="consultant"
     src="https://your-app-url.vercel.app/consultant/"
     style="width:100%;height:100%;border:none;"
   />
4. Make full-width, full-height
5. Optional: Require consultant login
```

#### Page 3: My Profile (Member Only)

```
Wix Editor:
1. Add new page "My Profile" (or "Member")
2. Add permission: Members only
3. Remove default page elements
4. Add HTML Embed:
   <iframe 
     id="customer"
     src="https://your-app-url.vercel.app/customer/"
     style="width:100%;height:100%;border:none;"
   />
5. Make full-width, full-height
6. Requires Wix login
```

---

### STEP 3: Configure Apps for Wix

Each app needs to know:
1. Where it's running (iframe vs standalone)
2. Who is logged in (Wix member)
3. Shop/instance ID

#### Add to each app's config:

```javascript
// src/apps/storefront/config/wixConfig.js
export const wixConfig = {
  isEmbeddedInWix: window.self !== window.top,
  wixMember: window.Wix?.user?.id,
  wixToken: window.Wix?.user?.accessToken,
};
```

#### Update apps to pass Wix context:

```javascript
// In each app's index.jsx
function AppRoot() {
  useEffect(() => {
    // Get Wix member info via postMessage
    if (window.self !== window.top) { // Inside iframe
      window.parent.postMessage({
        type: 'WIX_GET_USER',
      }, '*');
      
      window.addEventListener('message', (e) => {
        if (e.data.type === 'WIX_USER_DATA') {
          setWixUser(e.data.user);
        }
      });
    }
  }, []);
}
```

---

### STEP 4: Backend Configuration

Update APIs to accept Wix context:

```javascript
// backend/Controller/storefrontController.js
const getStorefrontConsultants = async (req, res) => {
  const wixToken = req.headers['x-wix-token'];
  const wixMemberId = req.headers['x-wix-member-id'];
  
  // Use Wix token to get instance
  const instance = await getWixInstance(wixToken);
  
  // Return consultants for this shop
  // ...
};
```

---

### STEP 5: Wix Menu Integration

**Add menu items in Wix:**

```
Wix Navigation Menu:
├── Home (existing)
├── Shop (existing)
├── Our Consultants → Links to /our-consultants page
├── Become a Consultant → Links to /become-consultant page
├── My Profile → Links to /my-profile page (member only)
└── More (existing)
```

**Configure in Wix:**
1. Wix Editor → Pages
2. Create/Update navigation menu
3. Add links to new pages
4. Set visibility rules (public vs member-only)

---

## BETTER OPTIONS & BEST PRACTICES

### BEST PRACTICE #1: Use Wix Native Where Possible

Instead of React for simple pages:
```
✅ Use Wix native for:
   - Home page
   - Shop/products
   - Blog
   - Contact
   - About

⚠️ Use React for complex apps:
   - Consultant marketplace
   - Consultant dashboard
   - Customer account
```

---

### BEST PRACTICE #2: Proper Authentication

**Current issue:** Apps don't know if user is logged in

**Solution:**
```javascript
// Add Wix authentication check
async function getWixUser() {
  if (window.Wix?.user?.id) {
    return {
      id: window.Wix.user.id,
      email: window.Wix.user.email,
      name: window.Wix.user.name,
    };
  }
  return null;
}

// Use in apps
const user = await getWixUser();
if (!user && isProtectedRoute) {
  redirect('/login'); // Wix login
}
```

---

### BEST PRACTICE #3: Shared Wix Integration

Create a Wix service both apps can use:

```javascript
// shared/services/wixService.js
export const wixService = {
  // Get logged-in Wix member
  async getUser() {
    return window.Wix?.user;
  },
  
  // Get shop/instance info
  async getShop() {
    return window.Wix?.site?.siteId;
  },
  
  // Handle Wix events
  onUserLogin(callback) {
    window.addEventListener('wix:user-login', callback);
  },
  
  // Call Wix backend APIs
  async callWixAPI(method, path, data) {
    const response = await fetch(`/api/wix/${method}${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${window.Wix.user.accessToken}`,
      },
    });
    return response.json();
  },
};
```

---

### BEST PRACTICE #4: Environment-Aware Routing

Apps should know where they're running:

```javascript
// utils/environment.js
export const env = {
  isWix: window.self !== window.top,
  isDev: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  wixMemberId: window.Wix?.user?.id,
  wixShopId: window.Wix?.site?.siteId,
};

// Use in apps
if (env.isWix && !env.wixMemberId) {
  // Show Wix login prompt
}
```

---

### BEST PRACTICE #5: Handle IFrame Sizing

Wix iframes need proper sizing:

```javascript
// utils/iframeResize.js
function resizeIframe() {
  const height = document.body.scrollHeight;
  
  // Tell parent iframe to resize
  window.parent.postMessage({
    type: 'WIX_RESIZE_IFRAME',
    height: height,
  }, '*');
}

// Watch for content changes
const observer = new MutationObserver(resizeIframe);
observer.observe(document.body, {
  subtree: true,
  childList: true,
});
```

---

## COMPARISON TABLE

| Aspect | Option 1: Widgets | Option 2: iFrames | Option 3: Hybrid |
|--------|-----------------|-----------------|-----------------|
| **Performance** | ❌ Slow (2MB) | ✅ Fast (~50-200KB) | ✅✅ Fastest |
| **Scalability** | ❌ Limited | ✅ Excellent | ✅ Excellent |
| **Wix Integration** | ⚠️ Native | ✅ Good | ✅✅ Native + Custom |
| **SEO** | ❌ Poor | ⚠️ Okay | ✅ Good |
| **Development** | ❌ Complex | ✅ Simple | ✅ Moderate |
| **Hosting** | On Wix | Separate | Separate |
| **Cost** | $0 (included) | $5-20/mo | $5-20/mo |
| **Recommendation** | ❌ Not recommended | ✅ Good | ✅✅ Best |

---

## MY RECOMMENDATION

### Use OPTION 3: Hybrid Approach

**Why:**
- ✅ Professional appearance (Wix native header)
- ✅ Fast performance (React apps ~50-200KB)
- ✅ Scalable (apps separate, can grow independently)
- ✅ Better user experience
- ✅ SEO-friendly (Wix handles main site)
- ✅ Cost-effective (free hosting on Vercel)

**Implementation:**
1. Deploy 3 apps to Vercel (free)
2. Create Wix pages (Our Consultants, Become Consultant, My Profile)
3. Embed apps via iframes
4. Use Wix authentication
5. Connect to backend APIs

**Timeline:**
- Day 1: Deploy apps to Vercel
- Day 2: Create Wix pages
- Day 3: Configure authentication
- Day 4: Test and launch

---

## SECURITY CONSIDERATIONS

### CORS Configuration

```javascript
// backend/.env
CORS_ORIGINS=https://yourdomain.com,https://your-app.vercel.app

// backend/cors-config.js
const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### iFrame Sandbox

```html
<!-- Secure iframe -->
<iframe 
  src="https://your-app.vercel.app/storefront/"
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
  allow="camera; microphone"
  style="width:100%;height:100%;border:none;"
/>
```

---

## SUMMARY

**Recommended:** Option 3 (Hybrid Approach)
- Wix native header/footer
- React apps embedded as iframes
- Separate hosting (Vercel)
- Total implementation time: 3-4 days

**Cost:** ~$0-20/month (free tier available)

**Result:** Professional, fast, scalable platform

---

**Ready to implement? Let me know and I'll:**
1. Create deployment configurations
2. Set up Vercel hosting
3. Configure Wix pages
4. Set up authentication flow
