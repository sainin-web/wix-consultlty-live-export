/**
 * Wix Authentication Service
 *
 * Handles obtaining Wix access tokens for the Consultly storefront.
 * Works with Wix App Page environment.
 *
 * Token sources (in priority order):
 * 1. URL query params (?accessToken=... or ?instance=...)
 * 2. Custom element attributes (data-access-token, data-instance)
 * 3. localStorage (persisted from previous session)
 * 4. postMessage from Wix parent
 * 5. Backend /api/wix-context endpoint (Wix adds auth headers automatically)
 */

/**
 * Check if running inside Wix (iframe or custom element context)
 */
export function isInWixContext() {
  const inIframe = window.self !== window.top;
  const hasWixOrigin = /wix\.com|wixsite\.com|wix-dev-sites\.org/.test(document.referrer);
  return inIframe || hasWixOrigin;
}

/**
 * Get Wix access token from multiple sources
 */
export async function getWixAccessToken() {
  console.log('[WIX-AUTH] Attempting to obtain access token...');

  // 1. Check URL params first
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('accessToken') || urlParams.get('token') || urlParams.get('instance');
  if (urlToken) {
    console.log('[WIX-AUTH] Token from URL params');
    localStorage.setItem('wix_access_token', urlToken);
    localStorage.setItem('wix_instance', urlToken);
    return urlToken;
  }

  // 2. Check custom element attributes
  try {
    const customElement = document.querySelector('consultant-widget') ||
                          document.querySelector('our-consultant') ||
                          document.querySelector('[data-access-token]');

    if (customElement) {
      const attrToken = customElement.getAttribute('data-access-token') ||
                       customElement.getAttribute('data-instance') ||
                       customElement.getAttribute('accessToken') ||
                       customElement.getAttribute('instance');

      if (attrToken) {
        console.log('[WIX-AUTH] Token from custom element attributes');
        localStorage.setItem('wix_access_token', attrToken);
        localStorage.setItem('wix_instance', attrToken);
        return attrToken;
      }
    }
  } catch (err) {
    console.warn('[WIX-AUTH] Failed to check custom element attributes:', err.message);
  }

  // 3. Check localStorage (from previous session)
  const storedToken = localStorage.getItem('wix_access_token');
  if (storedToken) {
    console.log('[WIX-AUTH] Token from localStorage');
    return storedToken;
  }

  // 4. Check if Wix has set global context
  if (window.wixContext) {
    try {
      // Try to get token from Wix SDK if available
      if (typeof window.wixContext.getAccessToken === 'function') {
        const token = await window.wixContext.getAccessToken();
        if (token) {
          console.log('[WIX-AUTH] Token from window.wixContext');
          localStorage.setItem('wix_access_token', token);
          return token;
        }
      }
    } catch (err) {
      console.warn('[WIX-AUTH] Failed to get token from wixContext:', err.message);
    }
  }

  // 5. Try to get token via backend /api/wix-context
  // When running in Wix App Page, Wix automatically adds auth headers to our backend requests
  try {
    const backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:3500';
    const response = await fetch(`${backendHost}/api/wix-context`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        console.log('[WIX-AUTH] Token from backend /api/wix-context');
        localStorage.setItem('wix_access_token', data.accessToken);
        localStorage.setItem('wix_id', data.shopId);
        return data.accessToken;
      }
    } else {
      console.warn('[WIX-AUTH] Backend returned:', response.status);
    }
  } catch (err) {
    console.warn('[WIX-AUTH] Backend /api/wix-context call failed:', err.message);
  }

  console.warn('[WIX-AUTH] No access token available from any source');
  return null;
}

/**
 * Wait for Wix access token to be available
 * Tries to get token, retries with backoff if not immediately available
 */
export async function waitForWixAccessToken(maxAttempts = 10, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    const token = await getWixAccessToken();
    if (token) {
      console.log('[WIX-AUTH] Access token obtained on attempt', i + 1);
      return token;
    }

    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.warn('[WIX-AUTH] Failed to obtain access token after', maxAttempts, 'attempts');
  return null;
}

/**
 * Get authorization header for backend requests
 */
export function getAuthorizationHeader(accessToken) {
  if (!accessToken) return null;
  return `Bearer ${accessToken}`;
}
