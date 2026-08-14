# WIX IFRAME INTEGRATION TEMPLATES

This document provides HTML/JavaScript code templates for embedding React apps in Wix pages.

## Page 1: Our Consultants (Public Storefront)

### Wix Page Setup:
1. Create a new Wix page called "Our Consultants"
2. Add to navigation menu
3. Set visibility: Public (no login required)

### HTML Embed Code:
```html
<!-- HTML Embed Element in Wix -->
<div id="storefront-container" style="width: 100%; height: 100%; border: none;">
  <iframe
    id="storefront-iframe"
    src="https://storefront-app.vercel.app/"
    style="width: 100%; height: 100vh; border: none; overflow: hidden;"
    frameborder="0"
    allow="camera; microphone"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="Consultant Marketplace"
  ></iframe>
</div>

<script>
  // Handle iframe resizing from React app
  window.addEventListener('message', (event) => {
    // Validate origin
    if (event.origin !== 'https://storefront-app.vercel.app') {
      console.warn('Message from untrusted origin:', event.origin);
      return;
    }

    if (event.data?.type === 'RESIZE_IFRAME') {
      const iframe = document.getElementById('storefront-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });

  // Notify React app about Wix context
  const iframe = document.getElementById('storefront-iframe');
  iframe.onload = function() {
    iframe.contentWindow.postMessage(
      {
        type: 'WIX_CONTEXT',
        isPublic: true,
        siteId: Wix.site?.siteId,
        instanceId: Wix.site?.instanceId,
      },
      'https://storefront-app.vercel.app'
    );
  };
</script>
```

---

## Page 2: Become a Consultant (Consultant Portal)

### Wix Page Setup:
1. Create a new Wix page called "Become a Consultant"
2. Add to navigation menu
3. Set visibility: Public (login required via Consultant Portal)

### HTML Embed Code:
```html
<!-- HTML Embed Element in Wix -->
<div id="consultant-container" style="width: 100%; height: 100%; border: none;">
  <iframe
    id="consultant-iframe"
    src="https://consultant-app.vercel.app/"
    style="width: 100%; height: 100vh; border: none; overflow: hidden;"
    frameborder="0"
    allow="camera; microphone"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="Consultant Portal"
  ></iframe>
</div>

<script>
  // Handle iframe resizing
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://consultant-app.vercel.app') {
      console.warn('Message from untrusted origin:', event.origin);
      return;
    }

    if (event.data?.type === 'RESIZE_IFRAME') {
      const iframe = document.getElementById('consultant-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }

    // Handle logout - redirect to home
    if (event.data?.type === 'LOGOUT') {
      window.location.href = '/';
    }
  });

  // Notify React app
  const iframe = document.getElementById('consultant-iframe');
  iframe.onload = function() {
    iframe.contentWindow.postMessage(
      {
        type: 'WIX_CONTEXT',
        isConsultantPortal: true,
        siteId: Wix.site?.siteId,
      },
      'https://consultant-app.vercel.app'
    );
  };
</script>
```

---

## Page 3: My Profile (Customer Portal)

### Wix Page Setup:
1. Create a new Wix page called "My Profile" (or "Member Area")
2. Add to navigation menu
3. Set visibility: Members only (requires Wix login)

### HTML Embed Code:
```html
<!-- HTML Embed Element in Wix -->
<div id="customer-container" style="width: 100%; height: 100%; border: none;">
  <iframe
    id="customer-iframe"
    src="https://customer-app.vercel.app/"
    style="width: 100%; height: 100vh; border: none; overflow: hidden;"
    frameborder="0"
    allow="camera; microphone"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="Member Area"
  ></iframe>
</div>

<script>
  // Handle iframe resizing
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://customer-app.vercel.app') {
      console.warn('Message from untrusted origin:', event.origin);
      return;
    }

    if (event.data?.type === 'RESIZE_IFRAME') {
      const iframe = document.getElementById('customer-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }

    // Handle logout - redirect to home
    if (event.data?.type === 'LOGOUT') {
      window.location.href = '/';
    }
  });

  // Get Wix member info and pass to React app
  const iframe = document.getElementById('customer-iframe');
  
  iframe.onload = function() {
    // Get current Wix member
    if (typeof Wix !== 'undefined' && Wix.User) {
      Wix.User.getCurrentUser().then((user) => {
        iframe.contentWindow.postMessage(
          {
            type: 'WIX_MEMBER_DATA',
            userId: user?.id,
            email: user?.email,
            isLoggedIn: !!user?.id,
            siteId: Wix.site?.siteId,
          },
          'https://customer-app.vercel.app'
        );
      });
    }
  };
</script>
```

---

## Alternative: Using Wix Native Velo Code

If you prefer to use Wix Velo code instead of raw HTML, here's an example:

### Velo Page Code (for custom page):

```javascript
// Page code for "Become a Consultant" page in Wix

import wixLocation from 'wix-location';
import wixWindow from 'wix-window';

$w.onReady(function () {
  // Get the iframe element
  const iframe = $w('#consultantIframe');

  // Listen for messages from the iframe
  window.addEventListener('message', (event) => {
    // Validate origin
    if (event.origin !== 'https://consultant-app.vercel.app') {
      console.error('Untrusted origin:', event.origin);
      return;
    }

    switch (event.data?.type) {
      case 'RESIZE_IFRAME':
        iframe.style.height = event.data.height + 'px';
        break;

      case 'LOGOUT':
        wixLocation.to('/');
        break;

      case 'ERROR':
        console.error('Iframe error:', event.data.message);
        break;
    }
  });

  // Send Wix context to iframe
  iframe.onload = function() {
    iframe.contentWindow.postMessage(
      {
        type: 'WIX_CONTEXT',
        siteId: wixWindow.rendering.env.siteId,
        isConsultantPortal: true,
      },
      'https://consultant-app.vercel.app'
    );
  };
});
```

### HTML Element in Wix Page (matching the Velo code):

```html
<iframe
  id="consultantIframe"
  src="https://consultant-app.vercel.app/"
  style="width: 100%; height: 100vh; border: none;"
  frameborder="0"
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
  title="Consultant Portal"
></iframe>
```

---

## Security Notes

### X-Frame-Options Header
- Set to `ALLOWALL` in vercel.json to allow framing from any origin
- Production: Consider restricting to specific Wix domain only

### Content-Security-Policy
- React apps allow `frame-ancestors *` for maximum compatibility
- Production: Restrict to `frame-ancestors 'self' yourdomain.com`

### Sandbox Attributes
Used in the iframe:
- `allow-same-origin` — Allows access to localStorage, cookies
- `allow-scripts` — Allows JavaScript execution
- `allow-forms` — Allows form submissions
- `allow-popups` — Allows popup windows for authentication
- `allow-popups-to-escape-sandbox` — Allows OAuth redirects to escape sandbox

### postMessage Validation
Always validate:
1. `event.origin` — Check origin matches expected domain
2. `event.data.type` — Validate message type
3. Never trust user data from iframe without validation

---

## Troubleshooting

### Iframe Not Loading
- Check browser console for CORS errors
- Verify deployment URL is correct
- Check X-Frame-Options header

### postMessage Not Working
- Verify target origin matches iframe src
- Check browser console for security warnings
- Ensure message format is correct

### Layout Issues
- Ensure iframe has `width: 100%; height: 100vh`
- Set `border: none` and `frameborder="0"`
- Consider using `overflow: hidden`

### Authentication Issues
- Verify Wix member is logged in (for customer portal)
- Check localStorage is accessible (same-origin required)
- Verify postMessage carries correct user data

---

## Next Steps

1. **Update URLs**: Replace `https://storefront-app.vercel.app` with actual deployment URLs
2. **Create Wix Pages**: Follow the steps for each page
3. **Add HTML Embeds**: Paste the code into Wix HTML embed elements
4. **Test in Preview**: Test each page in Wix editor preview
5. **Test Authentication**: Test login/logout flows
6. **Mobile Test**: Test on mobile devices
7. **Launch**: Publish Wix site
