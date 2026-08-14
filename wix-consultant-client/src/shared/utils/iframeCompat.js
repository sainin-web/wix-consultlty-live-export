/**
 * iFrame Compatibility Utilities
 *
 * Handles communication between React apps and Wix parent window.
 * Supports:
 * - Wix member/user data detection
 * - iFrame resizing based on content
 * - postMessage communication
 * - Origin validation
 */

/**
 * Check if running inside Wix iframe
 */
export function isInsideWixIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return false;
  }
}

/**
 * Get Wix instance/environment info
 */
export function getWixInstanceInfo() {
  return {
    isWix: isInsideWixIframe(),
    wixMetaData: window.wixMetaData || null,
    instanceId: window.wixMetaData?.instanceId || null,
    siteId: window.wixMetaData?.siteId || null,
  };
}

/**
 * Send message to Wix parent window
 * @param {string} type - Message type
 * @param {object} data - Message data
 * @param {string} targetOrigin - Target origin (default: '*' for same-domain)
 */
export function postMessageToWix(type, data = {}, targetOrigin = '*') {
  if (!isInsideWixIframe()) {
    console.log('[iframeCompat] Not inside iframe, skipping postMessage');
    return;
  }

  try {
    window.parent.postMessage(
      {
        type,
        source: 'react-app',
        timestamp: Date.now(),
        ...data,
      },
      targetOrigin
    );
  } catch (error) {
    console.error('[iframeCompat] Error posting message to parent:', error);
  }
}

/**
 * Listen for messages from Wix parent
 * @param {string} messageType - Type to listen for
 * @param {function} callback - Called when message received
 * @param {string} expectedOrigin - Expected origin (for validation)
 */
export function onMessageFromWix(messageType, callback, expectedOrigin = null) {
  const handler = (event) => {
    // Validate origin if specified
    if (expectedOrigin && event.origin !== expectedOrigin) {
      console.warn('[iframeCompat] Message from unexpected origin:', event.origin);
      return;
    }

    // Validate message type
    if (event.data?.type === messageType) {
      callback(event.data);
    }
  };

  window.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handler);
  };
}

/**
 * Auto-resize iframe based on content height
 * Call this after content changes
 */
export function resizeIframe() {
  if (!isInsideWixIframe()) {
    return;
  }

  try {
    const height = document.documentElement.scrollHeight || document.body.scrollHeight;
    const width = window.innerWidth;

    postMessageToWix('RESIZE_IFRAME', {
      height: Math.max(height, 300),
      width: width,
    });
  } catch (error) {
    console.error('[iframeCompat] Error resizing iframe:', error);
  }
}

/**
 * Watch for content changes and auto-resize
 */
export function setupIframeAutoResize() {
  if (!isInsideWixIframe()) {
    return;
  }

  // Initial resize
  resizeIframe();

  // Resize on window resize
  window.addEventListener('resize', resizeIframe);

  // Observe DOM changes
  const observer = new MutationObserver(() => {
    resizeIframe();
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: false,
  });

  // Cleanup
  return () => {
    window.removeEventListener('resize', resizeIframe);
    observer.disconnect();
  };
}

/**
 * Get API URL (internal or external)
 */
export function getApiUrl() {
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fall back to backend host
  if (process.env.REACT_APP_BACKEND_HOST) {
    return process.env.REACT_APP_BACKEND_HOST;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3500';
  }

  // Production fallback
  return 'https://api.example.com';
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins() {
  const origins = [
    window.location.origin,
  ];

  // Add Wix domain if available
  if (process.env.REACT_APP_WIX_DOMAIN) {
    origins.push(process.env.REACT_APP_WIX_DOMAIN);
  }

  // Add backend domain
  if (process.env.REACT_APP_BACKEND_HOST) {
    const backendUrl = new URL(process.env.REACT_APP_BACKEND_HOST);
    origins.push(backendUrl.origin);
  }

  return origins;
}

/**
 * Validate CORS origin
 */
export function isOriginAllowed(origin) {
  return getAllowedOrigins().includes(origin);
}

export default {
  isInsideWixIframe,
  getWixInstanceInfo,
  postMessageToWix,
  onMessageFromWix,
  resizeIframe,
  setupIframeAutoResize,
  getApiUrl,
  getAllowedOrigins,
  isOriginAllowed,
};
