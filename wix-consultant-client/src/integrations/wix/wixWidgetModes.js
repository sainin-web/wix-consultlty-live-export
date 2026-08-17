/**
 * Widget mode management (STOREFRONT vs DASHBOARD)
 * Controls visibility of Wix header/footer and widget behavior
 */

import React from 'react';
import { WIX_ENVIRONMENT } from './wixEnvironment';

class WidgetModeManager {
  constructor() {
    this.currentMode = WIX_ENVIRONMENT.WIDGET_MODE.STOREFRONT;
    this.listeners = [];
  }

  /**
   * Set the widget mode and notify listeners
   */
  setMode(mode) {
    if (mode === this.currentMode) return;

    console.log('[WidgetMode] Switching:', this.currentMode, '→', mode);
    this.currentMode = mode;
    this.applyMode(mode);
    this.notifyListeners(mode);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Check if in dashboard mode
   */
  isDashboardMode() {
    return this.currentMode === WIX_ENVIRONMENT.WIDGET_MODE.DASHBOARD;
  }

  /**
   * Check if in storefront mode
   */
  isStorefrontMode() {
    return this.currentMode === WIX_ENVIRONMENT.WIDGET_MODE.STOREFRONT;
  }

  /**
   * Apply visual changes for mode
   */
  applyMode(mode) {
    if (mode === WIX_ENVIRONMENT.WIDGET_MODE.DASHBOARD) {
      // Dashboard mode: take full viewport
      document.documentElement.classList.add('wix-dashboard-mode');
      document.body.classList.add('wix-dashboard-mode');
      this.hideWixShell();
    } else {
      // Storefront mode: normal Wix page
      document.documentElement.classList.remove('wix-dashboard-mode');
      document.body.classList.remove('wix-dashboard-mode');
      this.showWixShell();
    }
  }

  /**
   * Hide Wix header and footer (sends message to parent)
   */
  hideWixShell() {
    if (window.self === window.top) {
      console.log('[WidgetMode] Not in iframe, skipping shell hide');
      return;
    }

    window.parent.postMessage(
      {
        type: 'WIX_SHELL_HIDE',
        mode: WIX_ENVIRONMENT.WIDGET_MODE.DASHBOARD,
      },
      '*'
    );

    // Add CSS for fullscreen dashboard
    this.injectDashboardStyles();
  }

  /**
   * Show Wix header and footer (sends message to parent)
   */
  showWixShell() {
    if (window.self === window.top) {
      console.log('[WidgetMode] Not in iframe, skipping shell show');
      return;
    }

    window.parent.postMessage(
      {
        type: 'WIX_SHELL_SHOW',
        mode: WIX_ENVIRONMENT.WIDGET_MODE.STOREFRONT,
      },
      '*'
    );

    this.removeDashboardStyles();
  }

  /**
   * Inject CSS for dashboard fullscreen
   */
  injectDashboardStyles() {
    if (document.getElementById('wix-dashboard-styles')) return;

    const style = document.createElement('style');
    style.id = 'wix-dashboard-styles';
    style.textContent = `
      html.wix-dashboard-mode,
      body.wix-dashboard-mode {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      .wix-dashboard-mode #root,
      .wix-dashboard-mode [id*="root"],
      .wix-dashboard-mode .consultant-dashboard-shell {
        height: 100vh;
        width: 100%;
        overflow-y: auto;
      }

      .wix-embed.wix-dashboard-mode {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove dashboard styles
   */
  removeDashboardStyles() {
    const style = document.getElementById('wix-dashboard-styles');
    if (style) style.remove();
  }

  /**
   * Subscribe to mode changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of mode change
   */
  notifyListeners(mode) {
    this.listeners.forEach(listener => listener(mode));
  }
}

export const widgetModeManager = new WidgetModeManager();

/**
 * Hook to use widget mode in React components
 */
export function useWidgetMode() {
  const [mode, setMode] = React.useState(widgetModeManager.getMode());

  React.useEffect(() => {
    const unsubscribe = widgetModeManager.subscribe(setMode);
    return unsubscribe;
  }, []);

  return {
    mode,
    isDashboard: mode === WIX_ENVIRONMENT.WIDGET_MODE.DASHBOARD,
    isStorefront: mode === WIX_ENVIRONMENT.WIDGET_MODE.STOREFRONT,
    setMode: widgetModeManager.setMode.bind(widgetModeManager),
  };
}

export default widgetModeManager;
