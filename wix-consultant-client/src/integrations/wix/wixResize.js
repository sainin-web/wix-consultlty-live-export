/**
 * Enhanced iframe resizing for Wix widget
 * Responsive sizing without hardcoded heights or feedback loops
 */

import React from 'react';
import { WIX_ENVIRONMENT } from './wixEnvironment';
import { wixBridge } from './wixBridge';
import { widgetModeManager } from './wixWidgetModes';

export class WixResizer {
  constructor() {
    this.resizeObserver = null;
    this.debounceTimer = null;
    this.lastHeight = 0;
    this.isActive = false;
    this.debug = process.env.NODE_ENV === 'development'; // Debug mode
  }

  /**
   * Initialize resizer and start monitoring content
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;

    if (this.debug) {
      console.log('[WixResize.start] Initializing resize monitor');
      console.log('  - isEmbedded:', window.self !== window.top);
      console.log('  - document.body:', document.body);
      console.log('  - #root:', document.getElementById('root'));
    }

    // Initial measurement (delayed to allow React to render)
    setTimeout(() => this.measure(), 50);

    // Listen for window resize
    window.addEventListener('resize', () => this.debouncedMeasure());

    // Observe DOM changes
    this.setupResizeObserver();

    // Watch route changes
    window.addEventListener('popstate', () => this.debouncedMeasure());

    console.log('[WixResize] ✓ Monitoring started (content-based sizing active)');
  }

  /**
   * Stop monitoring content
   */
  stop() {
    this.isActive = false;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', () => this.debouncedMeasure());
    window.removeEventListener('popstate', () => this.debouncedMeasure());
    clearTimeout(this.debounceTimer);
    console.log('[WixResize] Stopped monitoring');
  }

  /**
   * Debounce height measurements to avoid excessive postMessages
   */
  debouncedMeasure() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.measure(), 150);
  }

  /**
   * Measure content and apply height directly + send to parent
   */
  measure() {
    if (!this.isActive) {
      return;
    }

    const height = this.calculateHeight();
    const change = Math.abs(height - this.lastHeight);
    const isSignificantChange = change > 15;

    if (this.debug) {
      console.log('[WixResize.measure]', {
        calculated: height,
        previous: this.lastHeight,
        change: change,
        isSignificant: isSignificantChange,
        mode: widgetModeManager?.getMode?.() || 'unknown',
      });
    }

    // Only update if height changed significantly (tolerance: 15px)
    if (isSignificantChange) {
      this.lastHeight = height;

      // Apply height directly to document/html
      this.applyHeight(height);

      // Always send height to Wix (works for both custom elements and iframes)
      wixBridge.updateHeight(height);

      console.log('[WixResize] ✓ Height updated:', height, 'px (sent to Wix)');
    }
  }

  /**
   * Apply calculated height to the document
   */
  applyHeight(height) {
    // Set on html, body, and root containers
    document.documentElement.style.height = 'auto';
    document.documentElement.style.minHeight = height + 'px';

    document.body.style.height = 'auto';
    document.body.style.minHeight = height + 'px';

    if (this.debug) {
      console.log('[WixResize.applyHeight] Applied:', {
        height: height + 'px',
        htmlMinHeight: document.documentElement.style.minHeight,
        bodyMinHeight: document.body.style.minHeight,
      });
    }
  }

  /**
   * Calculate height based on current mode and content
   */
  calculateHeight() {
    // Dashboard mode: use full viewport
    if (widgetModeManager?.isDashboardMode?.()) {
      const height = this.getDashboardHeight();
      if (this.debug) console.log('[WixResize.calculateHeight] DASHBOARD mode:', height);
      return height;
    }

    // Storefront mode: measure content
    const height = this.getContentHeight();
    if (this.debug) console.log('[WixResize.calculateHeight] STOREFRONT mode:', height);
    return height;
  }

  /**
   * Get dashboard height (full viewport)
   */
  getDashboardHeight() {
    const minHeight = WIX_ENVIRONMENT.IFRAME_CONFIG.DASHBOARD_MIN_HEIGHT;

    const screenBased = typeof window.screen?.height === 'number'
      ? Math.round(window.screen.height * 0.92)
      : minHeight;

    const viewportH =
      window.visualViewport?.height ||
      document.documentElement?.clientHeight ||
      0;

    return this.clampHeight(
      Math.max(minHeight, screenBased, viewportH)
    );
  }

  /**
   * Get content height (storefront mode) - for Wix Custom Element
   */
  getContentHeight() {
    // Check for chat page (special sizing)
    if (document.querySelector('.chat-route-shell')) {
      const height = this.getChatHeight();
      if (this.debug) console.log('[WixResize.getContentHeight] Chat page detected:', height);
      return height;
    }

    // Check for dashboard shell (shouldn't happen, but safe)
    if (document.querySelector('.consultant-dashboard-shell')) {
      const height = this.getDashboardHeight();
      if (this.debug) console.log('[WixResize.getContentHeight] Dashboard detected:', height);
      return height;
    }

    // Standard content measurement for Wix custom element
    const shell = document.querySelector('.iframe-page-shell');
    if (shell) {
      // Use scrollHeight for accurate content height
      const scrollHeight = shell.scrollHeight;
      const height = Math.ceil(scrollHeight + 16); // +16 for padding
      const clamped = this.clampHeight(height);
      if (this.debug) {
        console.log('[WixResize.getContentHeight] iframe-page-shell:', {
          scrollHeight,
          withPadding: height,
          clamped,
        });
      }
      return clamped;
    }

    // Fallback: measure all visible children of root
    const root = document.getElementById('root') || document.getElementById('consultant-root');
    const measureRoot = root || document.body;

    // Measure from top of body to bottom of last visible child
    let maxBottom = 0;

    Array.from(measureRoot.children).forEach((el) => {
      if (el.nodeType !== 1) return;

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      // Get element's position relative to viewport
      const rect = el.getBoundingClientRect();
      // Calculate absolute position (relative to document, not viewport)
      const absoluteBottom = rect.bottom + window.pageYOffset;
      maxBottom = Math.max(maxBottom, absoluteBottom);
    });

    // If no children found, measure the root itself
    if (maxBottom === 0) {
      const rootRect = measureRoot.getBoundingClientRect();
      maxBottom = rootRect.bottom + window.pageYOffset;
    }

    // Add bottom padding and clamp
    const finalHeight = Math.ceil(maxBottom + 16); // +16 for spacing
    return this.clampHeight(finalHeight);
  }

  /**
   * Get chat height (for video calling pages)
   */
  getChatHeight() {
    const minHeight = WIX_ENVIRONMENT.IFRAME_CONFIG.CHAT_MIN_HEIGHT;
    const screenBased = typeof window.screen?.height === 'number'
      ? Math.round(window.screen.height * 0.78)
      : minHeight;

    return this.clampHeight(
      Math.min(
        Math.max(minHeight, screenBased, window.innerHeight),
        WIX_ENVIRONMENT.IFRAME_CONFIG.MAX_HEIGHT
      )
    );
  }

  /**
   * Clamp height to min/max
   */
  clampHeight(height) {
    const min = WIX_ENVIRONMENT.IFRAME_CONFIG.MIN_HEIGHT;
    const max = WIX_ENVIRONMENT.IFRAME_CONFIG.MAX_HEIGHT;
    return Math.min(Math.max(Math.ceil(height), min), max);
  }

  /**
   * Setup ResizeObserver to detect DOM changes
   */
  setupResizeObserver() {
    if (!window.ResizeObserver) {
      console.warn('[WixResize] ResizeObserver not available');
      return;
    }

    try {
      this.resizeObserver = new ResizeObserver(() => {
        this.debouncedMeasure();
      });

      // Observe body and main content area
      const root = document.getElementById('root') || document.getElementById('consultant-root');
      if (root) {
        this.resizeObserver.observe(root);
      }

      const mainContent = document.querySelector('main') || document.body;
      this.resizeObserver.observe(mainContent);
    } catch (err) {
      console.error('[WixResize] Failed to setup ResizeObserver:', err);
    }
  }

  /**
   * Mark document as Wix embedded
   */
  markAsWixEmbed() {
    if (window.self === window.top) return;

    document.documentElement.classList.add('wix-embed');
    document.body.classList.add('wix-embed');
  }
}

export const wixResizer = new WixResizer();

/**
 * React hook for iframe resizing with route change detection
 */
export function useWixResize(location = null) {
  React.useEffect(() => {
    wixResizer.markAsWixEmbed();
    wixResizer.start();

    return () => {
      wixResizer.stop();
    };
  }, []);

  // Measure again when location changes (route change in React Router)
  React.useEffect(() => {
    // Wait for React to render the new content
    const timer = setTimeout(() => {
      wixResizer.measure();
    }, 100);

    return () => clearTimeout(timer);
  }, [location?.pathname]);
}

export default wixResizer;
