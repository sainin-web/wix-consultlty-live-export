# Wix Integration Testing Checklist

Complete testing checklist for the Wix widget integration before going live.

## Pre-Testing Setup

- [ ] Environment variables configured (.env files)
- [ ] Backend running and accessible
- [ ] Frontend built and deployed
- [ ] Wix app registered in Dev Center
- [ ] Widget added to Wix page
- [ ] ngrok tunnel running (for local testing)
- [ ] Browser DevTools open (Console, Network, Application tabs)

---

## Widget Loading & Initialization

### Basic Load
- [ ] Widget loads without errors
- [ ] No white blank iframe on page
- [ ] Console shows no ERROR messages
- [ ] Console shows `[WixResize] Started monitoring` message
- [ ] No 404 errors in Network tab
- [ ] CORS headers present in responses

### Widget Setup
- [ ] `consultant-widget` custom element registered
- [ ] Wix instance detected and stored in localStorage
- [ ] `[App] Wix integration initialized` logged

---

## Application Header Navigation

### Header Display
- [ ] Application header visible at top of widget
- [ ] Professional styling with clean UI
- [ ] Sticky positioning (stays at top when scrolling)
- [ ] Mobile-responsive (hamburger menu or stacked layout)

### Navigation Items
- [ ] "Our Consultants" button visible
- [ ] "Profile" button visible (when not logged in)
- [ ] "Become a Consultant" button visible (when not logged in)
- [ ] Buttons have proper hover states
- [ ] Active state shows current page

### Guest User Navigation (Not Logged In)

When user is not logged in:

1. **Our Consultants Link**
   - [ ] Clicking navigates to `/consultant/card`
   - [ ] Page loads consultant listing
   - [ ] "Our Consultants" button shows as active

2. **Profile Link**
   - [ ] Visible in header
   - [ ] Clicking navigates to `/profile`
   - [ ] Shows customer profile page
   - [ ] "Profile" button shows as active

3. **Become a Consultant Link**
   - [ ] Shows primary button style
   - [ ] Clicking navigates to `/login`
   - [ ] Shows consultant login form
   - [ ] "Become a Consultant" button shows as active

---

## Storefront Mode (Guest/Customer)

### Consultant Listing
- [ ] Loads consultant cards
- [ ] Cards display properly (photo, name, price, rating)
- [ ] Responsive grid layout (desktop/tablet/mobile)
- [ ] No excessive whitespace
- [ ] Scrolling works smoothly
- [ ] Search/filter works (if implemented)

### Consultant Profile View
- [ ] Click consultant card opens profile
- [ ] Profile shows all details
- [ ] "Book Consultation" or similar CTA visible
- [ ] Back button returns to listing
- [ ] Layout is responsive

### Customer Profile
- [ ] Navigation to profile works
- [ ] Profile form loads
- [ ] Can view personal information
- [ ] Edit functionality works (if implemented)
- [ ] Save button sends data to backend
- [ ] Success message shows

---

## Authentication Flow

### Login Page
- [ ] Login form displays
- [ ] Email field validates email format
- [ ] Password field masks input
- [ ] Submit button enabled when form valid
- [ ] Loading state shows during submission
- [ ] Error messages display for:
  - [ ] Invalid credentials
  - [ ] Missing fields
  - [ ] Network errors

### Successful Login
- [ ] Login submits to correct endpoint
- [ ] Backend validates credentials
- [ ] Token stored in localStorage
- [ ] `consultant_logged_in` flag set
- [ ] Page redirects to dashboard
- [ ] No console errors
- [ ] No 401 Unauthorized errors

### Failed Login
- [ ] Invalid email shows error message
- [ ] Wrong password shows error message
- [ ] Network error shows error message
- [ ] Can retry login without page refresh
- [ ] Form data clears after error (optional)

---

## Dashboard Mode (Logged In Consultant)

### Dashboard Access
- [ ] Successful login navigates to dashboard
- [ ] URL shows `/consultant-dashboard`
- [ ] Dashboard page loads
- [ ] No layout errors or broken styling

### Dashboard Mode Activation
- [ ] Wix header becomes hidden
- [ ] Wix footer becomes hidden
- [ ] Application header becomes hidden
- [ ] Dashboard fills available viewport
- [ ] `wix-dashboard-mode` class visible on html element
- [ ] Browser DevTools shows `[WidgetMode] Switching` message

### Dashboard Layout
- [ ] Consultant sidebar visible (if present)
- [ ] Dashboard content centered
- [ ] Navigation links work
- [ ] Responsive to window resize
- [ ] No overflow or horizontal scrolling
- [ ] No double vertical scrollbars
- [ ] Dashboard is readable on all screen sizes

### Dashboard Content
- [ ] Welcome message displays
- [ ] Earnings/stats visible
- [ ] Action buttons functional
- [ ] Tab navigation works
- [ ] Sub-pages load correctly

---

## Iframe Sizing

### Storefront Mode Height
- [ ] Initial load height calculated correctly
- [ ] Height updates when content loads
- [ ] Height adjusts when window resized
- [ ] No excessive whitespace below content
- [ ] No content cutoff at bottom
- [ ] Debounce prevents excessive postMessages
- [ ] Height stays within min/max bounds (500-4000px)

### Dashboard Mode Height
- [ ] Height set to viewport height
- [ ] Takes `window.screen.height * 0.92`
- [ ] Updates on window resize
- [ ] No content cutoff
- [ ] Scrolling works inside dashboard
- [ ] Height clamped to 900-4000px

### Dynamic Height Updates
- [ ] Content loads → height updates
- [ ] Window resized → height updates
- [ ] Route changed → height updates
- [ ] Modal opens → height updates
- [ ] Image loads → height updates
- [ ] Accordion expands → height updates

---

## Mode Switching

### Exit Dashboard (on Logout)
- [ ] Logout button works
- [ ] Token cleared from localStorage
- [ ] `consultant_logged_in` flag removed
- [ ] Page redirects to `/login` or `/consultant/card`
- [ ] Wix header appears
- [ ] Wix footer appears
- [ ] Application header reappears
- [ ] Widget returns to normal height
- [ ] Console shows `[WidgetMode] Switching: dashboard → storefront`

### Re-enter Dashboard
- [ ] Can log back in
- [ ] Dashboard mode reactivates
- [ ] Wix shell hides again
- [ ] Height switches to fullscreen

### Page Navigation During Dashboard
- [ ] Dashboard sub-pages work (chats, calls, etc.)
- [ ] Height updates for each page
- [ ] Navigation links functional
- [ ] Wix shell stays hidden
- [ ] Can return to main dashboard

---

## PostMessage Communication

### Widget → Wix
- [ ] `WIDGET_READY` sent on load
- [ ] `IFRAME_HEIGHT` sent with correct height
- [ ] `REQUEST_DASHBOARD_MODE` sent on login
- [ ] `EXIT_DASHBOARD_MODE` sent on logout
- [ ] Messages include timestamp and type
- [ ] No secrets/tokens in messages

### Wix → Widget
- [ ] Can receive user data from Wix
- [ ] Origin validation doesn't block valid messages
- [ ] Invalid origins are blocked
- [ ] Messages processed correctly

### Origin Validation
- [ ] Wix origins accepted
- [ ] Non-Wix origins rejected (with warning)
- [ ] Localhost accepted in development
- [ ] ngrok origins accepted in development
- [ ] Production origin correct

---

## API Integration

### Backend Connectivity
- [ ] Backend health check succeeds
- [ ] API endpoints respond
- [ ] CORS headers present
- [ ] No 403 Forbidden errors

### Authentication Endpoints
- [ ] Login endpoint works
- [ ] Token validation endpoint works
- [ ] User data endpoint works
- [ ] Logout endpoint works (if present)

### Data Endpoints
- [ ] Consultant listing loads
- [ ] Consultant profile loads
- [ ] Customer profile loads
- [ ] Chat/call data loads
- [ ] Wallet data loads

### Error Handling
- [ ] 401 Unauthorized handled (redirect to login)
- [ ] 403 Forbidden handled
- [ ] 404 Not Found handled
- [ ] 500 Server Error handled
- [ ] Network errors handled
- [ ] Timeout errors handled

---

## Security Testing

### Token Security
- [ ] JWT stored in localStorage (not URL)
- [ ] Token cleared on logout
- [ ] Token validated server-side
- [ ] Expired token redirects to login
- [ ] No token visible in Network tab URLs

### CORS
- [ ] Requests to authorized origins succeed
- [ ] Requests to unauthorized origins blocked
- [ ] Wildcard origin not used for authenticated APIs
- [ ] Credentials header present where needed

### postMessage
- [ ] Origins validated before processing
- [ ] Untrusted origins rejected
- [ ] No sensitive data in messages
- [ ] No code execution via message data

### CSP & Frame Policy
- [ ] Backend sends CSP headers
- [ ] Allows *.wix.com frame ancestor
- [ ] No "X-Frame-Options: DENY"

---

## Responsive Design

### Desktop (1920x1080)
- [ ] Widget full width
- [ ] Layout looks professional
- [ ] No unnecessary whitespace
- [ ] Spacing balanced

### Tablet (768x1024)
- [ ] Layout adapts
- [ ] Touch targets adequate (>44px)
- [ ] No horizontal scrolling
- [ ] Navigation accessible

### Mobile (375x667)
- [ ] Single column layout
- [ ] Text readable
- [ ] Buttons touchable
- [ ] No horizontal scroll
- [ ] Form inputs usable

### Landscape Mobile (667x375)
- [ ] Layout works in landscape
- [ ] Keyboard doesn't cover fields
- [ ] No layout issues

---

## Performance

### Initial Load
- [ ] First paint < 1 second
- [ ] Meaningful paint < 2 seconds
- [ ] Interactive < 3 seconds
- [ ] No blocking resources

### Network
- [ ] No unnecessary API calls
- [ ] Assets cached (images, CSS, JS)
- [ ] Minified bundles
- [ ] No duplicate resources

### Runtime
- [ ] No janky scrolling
- [ ] Smooth animations
- [ ] No console warnings
- [ ] Memory usage reasonable

---

## Browser Compatibility

### Chrome
- [ ] Latest version works
- [ ] No console errors
- [ ] Performance acceptable

### Firefox
- [ ] Latest version works
- [ ] All features functional
- [ ] No console errors

### Safari
- [ ] Latest version works
- [ ] Styling correct
- [ ] postMessage works

### Edge
- [ ] Latest version works
- [ ] No compatibility issues

### Mobile Browsers
- [ ] iOS Safari works
- [ ] Chrome Mobile works
- [ ] Firefox Mobile works
- [ ] Samsung Internet works

---

## Production Deployment

Before going live:

- [ ] All environment variables set
- [ ] No development URLs in production code
- [ ] Backend CORS configured for production
- [ ] HTTPS enabled on all domains
- [ ] Widget URL points to production CDN
- [ ] Wix app approved
- [ ] Error tracking configured
- [ ] Monitoring alerts set up
- [ ] Database backups working
- [ ] Documentation complete

---

## Post-Deployment Monitoring

First week:

- [ ] Monitor error logs daily
- [ ] Check analytics for load times
- [ ] Monitor API response times
- [ ] Check for user-reported issues
- [ ] Verify CORS is not blocking requests
- [ ] Monitor database performance
- [ ] Check token expiration issues

---

## Known Issues & Workarounds

### Issue: Wix shell not hiding
- Check widget mode in DevTools console
- Verify `REQUEST_DASHBOARD_MODE` message sent
- Check browser CSS for dashboard mode class

### Issue: Double scrollbar
- Usually iframe sizing issue
- Check `measureIframeContentHeight()` calculation
- Verify no fixed heights on containers

### Issue: CORS blocked
- Verify backend CORS_ALLOWED_ORIGINS set correctly
- Check domain exactly matches (https, www, etc.)
- Test with `curl -H "Origin: ..."`

### Issue: Token expires mid-session
- Implement token refresh logic
- Set appropriate token expiration
- Handle 401 responses with re-login

### Issue: Widget loads slow
- Check code splitting is working
- Verify lazy loading of heavy components
- Check API response times
- Optimize images

---

## Test Report Template

```
Date: 2025-08-17
Tester: [Name]
Environment: [dev/staging/production]
Browser: [Chrome/Firefox/Safari]
OS: [Windows/Mac/Linux/iOS/Android]

### Results:
- Passed: X/Y tests
- Failed: X tests
- Blocked: X tests
- Pending: X tests

### Failed Tests:
1. [Test name] - [Description of failure]
2. [Test name] - [Description of failure]

### Notes:
[Any additional observations]

### Sign-off:
- [ ] Ready for next environment
- [ ] Needs fixes before proceeding
```

---

## Sign-Off

- [ ] All critical tests passed
- [ ] No P1 or P2 bugs
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Ready for production
