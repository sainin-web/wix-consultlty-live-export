/**
 * Secure communication bridge between React widget and Wix parent
 * Validates all postMessage origins and handles widget-to-Wix communication
 */

import { isAllowedOrigin, WIX_ENVIRONMENT } from './wixEnvironment';

class WixBridge {
  constructor() {
    this.messageHandlers = {};
    this.setupMessageListener();
  }

  /**
   * Setup secure postMessage listener with origin validation
   */
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // CRITICAL: Validate origin
      if (!isAllowedOrigin(event.origin)) {
        console.warn('[WixBridge] Rejected message from untrusted origin:', event.origin);
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      const { type } = data;
      if (!type) return;

      console.log('[WixBridge] Received message:', type);

      // Handle registered message handlers
      if (this.messageHandlers[type]) {
        try {
          this.messageHandlers[type](data);
        } catch (err) {
          console.error('[WixBridge] Handler error for', type, ':', err);
        }
      }
    });
  }

  /**
   * Register handler for incoming messages from Wix parent
   */
  onMessage(type, handler) {
    this.messageHandlers[type] = handler;
    console.log('[WixBridge] Registered handler for:', type);

    return () => {
      delete this.messageHandlers[type];
    };
  }

  /**
   * Send message to parent Wix page (with origin validation)
   * Never send secrets or access tokens in postMessage
   */
  sendToParent(type, payload = {}) {
    if (window.self === window.top) {
      console.log('[WixBridge] Not in iframe, message not sent:', type);
      return;
    }

    const message = { type, ...payload };

    // Use a specific origin in production
    const targetOrigin = process.env.NODE_ENV === 'production'
      ? (process.env.REACT_APP_WIX_SITE_ORIGIN || '*')
      : '*';

    window.parent.postMessage(message, targetOrigin);
    console.log('[WixBridge] Sent to parent:', type);
  }

  /**
   * Notify Wix that widget is ready
   */
  notifyReady() {
    this.sendToParent('WIDGET_READY', {
      version: '1.0.0',
      mode: 'storefront',
    });
  }

  /**
   * Request Wix to enter dashboard mode (hide header/footer)
   */
  requestDashboardMode() {
    this.sendToParent('REQUEST_DASHBOARD_MODE', {
      timestamp: Date.now(),
    });
  }

  /**
   * Notify Wix to exit dashboard mode (show header/footer)
   */
  exitDashboardMode() {
    this.sendToParent('EXIT_DASHBOARD_MODE', {
      timestamp: Date.now(),
    });
  }

  /**
   * Send height update to Wix (for iframe resizing)
   * Uses a safe height clamping to prevent feedback loops
   */
  updateHeight(height) {
    const clamped = Math.max(
      WIX_ENVIRONMENT.IFRAME_CONFIG.MIN_HEIGHT,
      Math.min(height, WIX_ENVIRONMENT.IFRAME_CONFIG.MAX_HEIGHT)
    );

    this.sendToParent('IFRAME_HEIGHT', { height: clamped });
  }

  /**
   * Notify Wix of authentication state changes
   * Never send tokens, only send event type
   */
  notifyAuthChange(event) {
    if (event === 'LOGIN') {
      this.sendToParent('CONSULTANT_LOGIN', { timestamp: Date.now() });
    } else if (event === 'LOGOUT') {
      this.sendToParent('CONSULTANT_LOGOUT', { timestamp: Date.now() });
    }
  }

  /**
   * Notify Wix of navigation events
   */
  notifyNavigation(route) {
    this.sendToParent('NAVIGATION', { route });
  }

  /**
   * Verify connection to Wix (for debugging)
   */
  verifyConnection() {
    console.log('[WixBridge] Connection status:', {
      inIframe: window.self !== window.top,
      parentOrigin: document.referrer,
    });
  }
}

export const wixBridge = new WixBridge();

export default wixBridge;
