/**
 * CONSULTANT PORTAL ENTRY POINT
 *
 * Separate React app for consultant authenticated experience.
 * Routes:
 * - /consultant/login
 * - /consultant/register
 * - /consultant/dashboard
 * - /consultant/profile
 * - /consultant/availability
 * - /consultant/earnings
 * - /consultant/calls
 * - /consultant/settings
 *
 * Includes:
 * - Socket.IO (for real-time calls/chat)
 * - Consultant authentication
 * - Full consultant dashboard
 * - Profile management
 * - Earnings/wallet
 * - Call logs
 * - Chat
 *
 * Does NOT show:
 * - Public storefront
 * - Customer areas
 * - Admin areas
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import ConsultantApp from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { consultantStore } from './store/consultantStore';
import './index.css';

function ConsultantPortalRoot() {
  React.useEffect(() => {
    console.log('[CONSULTANT-APP] Mounted');
  }, []);

  return (
    <Provider store={consultantStore}>
      <BrowserRouter>
        <ConsultantApp />
      </BrowserRouter>
    </Provider>
  );
}

// Mount consultant app
const container = document.getElementById('root') || document.getElementById('consultant-root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ConsultantPortalRoot />
    </React.StrictMode>
  );
}

// Custom element for Wix embedding
if (!customElements.get('consultant-portal')) {
  class ConsultantPortal extends HTMLElement {
    connectedCallback() {
      if (!this._mounted) {
        this._mounted = true;
        const root = ReactDOM.createRoot(this);
        root.render(
          <React.StrictMode>
            <ConsultantPortalRoot />
          </React.StrictMode>
        );
      }
    }
    disconnectedCallback() {
      this._mounted = false;
    }
  }
  customElements.define('consultant-portal', ConsultantPortal);
}
