/**
 * Wix environment and configuration management
 * Centralizes all Wix-related configuration without exposing secrets in URLs
 */

export const WIX_ENVIRONMENT = {
  // Origins (no hardcoded secrets here)
  WIX_ORIGIN_PATTERNS: [
    /^https:\/\/[^/]+\.wix\.com$/i,
    /^https:\/\/[^/]+\.wixsite\.com$/i,
    /^https:\/\/[^/]+\.wix-dev-sites\.org$/i,
    /^https:\/\/[^/]+\.wix-development-sites\.org$/i,
    /^https:\/\/[^/]+\.wix-dev-center-test\.org$/i,
    /^https:\/\/[^/]+\.wixstudio\.com$/i,
    /^https:\/\/[^/]+\.wixstudio\.io$/i,
    /^https:\/\/manage\.wix\.com$/i,
    /^https:\/\/editor\.wix\.com$/i,
  ],

  LOCAL_DEV_PATTERNS: [
    /^http:\/\/localhost(:\d+)?$/i,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
    /^https:\/\/[^/]+\.ngrok-free\.dev$/i,
    /^https:\/\/[^/]+\.ngrok\.io$/i,
  ],

  // API endpoints (use REACT_APP_* from .env)
  BACKEND_HOST: process.env.REACT_APP_BACKEND_HOST || 'http://localhost:3500',
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',

  // Iframe sizing rules
  IFRAME_CONFIG: {
    MIN_HEIGHT: 500,
    MAX_HEIGHT: 4000,
    CHAT_MIN_HEIGHT: 700,
    DASHBOARD_MIN_HEIGHT: 900,
  },

  // Widget modes
  WIDGET_MODE: {
    STOREFRONT: 'storefront',
    DASHBOARD: 'dashboard',
  },
};

/**
 * Determine if origin is allowed for postMessage communication
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true;

  // Check Wix patterns
  if (WIX_ENVIRONMENT.WIX_ORIGIN_PATTERNS.some(pattern => pattern.test(origin))) {
    return true;
  }

  // Allow local dev
  if (process.env.NODE_ENV !== 'production') {
    if (WIX_ENVIRONMENT.LOCAL_DEV_PATTERNS.some(pattern => pattern.test(origin))) {
      return true;
    }
  }

  console.warn('[Wix] Blocked unauthorized origin:', origin);
  return false;
}

/**
 * Get allowed parent origin for postMessage validation
 * In production, this should match your Wix site domain
 */
export function getAllowedParentOrigin() {
  if (process.env.NODE_ENV === 'production') {
    // In production, parent should be your Wix site
    return process.env.REACT_APP_WIX_SITE_ORIGIN;
  }
  // In dev, allow any Wix origin or localhost
  return '*';
}
