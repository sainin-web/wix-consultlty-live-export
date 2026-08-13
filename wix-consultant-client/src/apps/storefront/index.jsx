/**
 * STOREFRONT ENTRY POINT
 *
 * This is a COMPLETELY SEPARATE React entry point for the public consultant marketplace.
 *
 * ✅ INCLUDES:
 * - Marketplace shell
 * - Consultant listing
 * - Consultant card
 * - Public profile view
 * - Skeleton loading
 * - Error/empty states
 * - Lightweight API client
 * - Public Redux store (listing only)
 *
 * ❌ DOES NOT INCLUDE:
 * - Socket.IO
 * - Chat
 * - Video calling
 * - Agora SDK
 * - Consultant dashboard
 * - Admin code
 * - Customer wallet
 * - Call history
 * - Firebase
 * - Authentication middleware
 * - Global app status validation that blocks rendering
 *
 * PERFORMANCE GOAL:
 * - Bundle size: < 100KB gzipped
 * - First render: < 300ms
 * - Time to interactive: < 1.5s
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import StorefrontApp from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { storefront Store } from './store/storefrontStore';
import './index.css';

// Performance mark: app start
if (window.performance && window.performance.mark) {
  window.performance.mark('storefront-app-start');
}

/**
 * Minimal storefront root component.
 * NO global providers except Redux + Router (required for state + navigation).
 * NO authentication providers.
 * NO socket initialization.
 * NO status validation.
 */
function StorefrontRoot() {
  React.useEffect(() => {
    if (window.performance && window.performance.mark) {
      window.performance.mark('storefront-root-mount');
      window.performance.measure('storefront-app-start→root-mount', 'storefront-app-start', 'storefront-root-mount');
    }
  }, []);

  return (
    <Provider store={storefrontStore}>
      <BrowserRouter>
        <StorefrontApp />
      </BrowserRouter>
    </Provider>
  );
}

// Mount storefront app
const container = document.getElementById('root') || document.getElementById('storefront-root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <StorefrontRoot />
    </React.StrictMode>
  );

  if (window.performance && window.performance.mark) {
    window.performance.mark('storefront-react-mount-complete');
  }
}

// Register custom element for Wix embedding (if needed)
if (!customElements.get('storefront-marketplace')) {
  class StorefrontMarketplace extends HTMLElement {
    connectedCallback() {
      if (!this._mounted) {
        this._mounted = true;
        const root = ReactDOM.createRoot(this);
        root.render(
          <React.StrictMode>
            <StorefrontRoot />
          </React.StrictMode>
        );
      }
    }
    disconnectedCallback() {
      this._mounted = false;
    }
  }
  customElements.define('storefront-marketplace', StorefrontMarketplace);
}
