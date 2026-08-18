/**
 * Context Detector
 *
 * Determines whether the app is running in:
 * 1. PUBLIC WIDGET context (Wix Site Widget)
 * 2. ADMIN DASHBOARD context (Wix Dashboard Page extension)
 *
 * Use this to prevent the public widget from loading inside the admin area
 * and vice versa.
 */

/**
 * Detect if running in Wix Admin Dashboard context
 * @returns {boolean} true if in admin dashboard
 */
export const isWixAdminContext = () => {
  // Check 1: Wix Dashboard API availability
  if (typeof window !== 'undefined' && window.Wix && window.Wix.Dashboard) {
    console.log("[CONTEXT] Detected: WIX ADMIN via window.Wix.Dashboard");
    return true;
  }

  // Check 2: Environment variable set during build
  if (process.env.REACT_APP_BUILD_TARGET === 'admin') {
    console.log("[CONTEXT] Detected: WIX ADMIN via REACT_APP_BUILD_TARGET");
    return true;
  }

  // Check 3: URL path indicates admin
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    console.log("[CONTEXT] Detected: WIX ADMIN via pathname");
    return true;
  }

  // Check 4: Presence of admin-specific query param
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wix-dashboard') === 'true') {
      console.log("[CONTEXT] Detected: WIX ADMIN via wix-dashboard param");
      return true;
    }
  }

  return false;
};

/**
 * Detect if running in Public Widget context
 * @returns {boolean} true if in public widget
 */
export const isPublicWidgetContext = () => {
  // If it's admin, it's not public
  if (isWixAdminContext()) {
    return false;
  }

  // Check 1: Custom element <consultant-widget> exists
  if (typeof window !== 'undefined' && document.querySelector('consultant-widget')) {
    console.log("[CONTEXT] Detected: PUBLIC WIDGET via <consultant-widget> element");
    return true;
  }

  // Check 2: Environment variable set during build
  if (process.env.REACT_APP_BUILD_TARGET === 'public-widget') {
    console.log("[CONTEXT] Detected: PUBLIC WIDGET via REACT_APP_BUILD_TARGET");
    return true;
  }

  // Check 3: No admin indicators
  if (typeof window !== 'undefined' && !window.Wix?.Dashboard) {
    console.log("[CONTEXT] Detected: PUBLIC WIDGET via absence of Wix.Dashboard");
    return true;
  }

  return false;
};

/**
 * Get context information for debugging
 */
export const getContextInfo = () => {
  if (typeof window === 'undefined') {
    return { context: 'unknown', isServer: true };
  }

  return {
    context: isWixAdminContext() ? 'admin' : 'public-widget',
    isWixAdminContext: isWixAdminContext(),
    isPublicWidgetContext: isPublicWidgetContext(),
    hasWixDashboard: !!(window.Wix?.Dashboard),
    hasDashboardAPI: !!(typeof window !== 'undefined' && window.Wix?.Dashboard),
    buildTarget: process.env.REACT_APP_BUILD_TARGET || 'unknown',
    pathname: window.location.pathname,
    params: Object.fromEntries(new URLSearchParams(window.location.search)),
  };
};

console.log("[CONTEXT INFO]", getContextInfo());
