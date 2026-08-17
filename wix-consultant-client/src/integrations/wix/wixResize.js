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
  }

  /**
   * Initialize resizer and start monitoring content
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Initial measurement
    this.measure();

    // Listen for window resize
    window.addEventListener('resize', () => this.debouncedMeasure());

    // Observe DOM changes
    this.setupResizeObserver();

    // Watch route changes
    window.addEventListener('popstate', () => this.debouncedMeasure());

    console.log('[WixResize] Started monitoring');
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
   * Measure content and send height to parent
   */
  measure() {
    if (!this.isActive || window.self === window.top) {
      return;
    }

    const height = this.calculateHeight();

    // Only send if height changed significantly
    if (Math.abs(height - this.lastHeight) > 10) {
      this.lastHeight = height;
      wixBridge.updateHeight(height);
    }
  }

  /**
   * Calculate height based on current mode and content
   */
  calculateHeight() {
    // Dashboard mode: use full viewport
    if (widgetModeManager.isDashboardMode()) {
      return this.getDashboardHeight();
    }

    // Storefront mode: measure content
    return this.getContentHeight();
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
   * Get content height (storefront mode)
   */
  getContentHeight() {
    // Check for chat page (special sizing)
    if (document.querySelector('.chat-route-shell')) {
      return this.getChatHeight();
    }

    // Check for dashboard shell (shouldn't happen, but safe)
    if (document.querySelector('.consultant-dashboard-shell')) {
      return this.getDashboardHeight();
    }

    // Standard content measurement
    const shell = document.querySelector('.iframe-page-shell');
    if (shell) {
      const rect = shell.getBoundingClientRect();
      const height = Math.ceil(
        Math.max(shell.scrollHeight, shell.offsetHeight, rect.height) +
        window.scrollY +
        12
      );
      return this.clampHeight(height);
    }

    // Fallback: measure root element
    const root = document.getElementById('root') || document.getElementById('consultant-root');
    const measureRoot = root || document.body;
    let bottom = 0;

    Array.from(measureRoot.children).forEach((el) => {
      if (el.nodeType !== 1) return;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom + window.scrollY);
    });

    if (bottom === 0) {
      bottom = measureRoot.getBoundingClientRect().bottom + window.scrollY;
    }

    return this.clampHeight(Math.ceil(bottom + 12));
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
 * React hook for iframe resizing
 */
export function useWixResize() {
  React.useEffect(() => {
    wixResizer.markAsWixEmbed();
    wixResizer.start();

    return () => {
      wixResizer.stop();
    };
  }, []);
}

export default wixResizer;
