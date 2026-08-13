/**
 * CUSTOMER PORTAL ENTRY POINT
 *
 * Separate React app for customer/member authenticated experience.
 * Routes:
 * - /member/profile
 * - /member/wallet
 * - /member/vouchers
 * - /member/history
 * - /member/calls
 * - /member/transactions
 *
 * Includes:
 * - Member profile
 * - Wallet/balance management
 * - Vouchers
 * - Call history
 * - Chat history
 * - Transaction history
 *
 * Does NOT show:
 * - Public storefront
 * - Consultant dashboard/admin
 * - Admin areas
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomerApp from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { customerStore } from './store/customerStore';
import './index.css';

function CustomerPortalRoot() {
  React.useEffect(() => {
    console.log('[CUSTOMER-APP] Mounted');
  }, []);

  return (
    <Provider store={customerStore}>
      <BrowserRouter>
        <CustomerApp />
      </BrowserRouter>
    </Provider>
  );
}

// Mount customer app
const container = document.getElementById('root') || document.getElementById('customer-root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <CustomerPortalRoot />
    </React.StrictMode>
  );
}

// Custom element for Wix embedding
if (!customElements.get('customer-portal')) {
  class CustomerPortal extends HTMLElement {
    connectedCallback() {
      if (!this._mounted) {
        this._mounted = true;
        const root = ReactDOM.createRoot(this);
        root.render(
          <React.StrictMode>
            <CustomerPortalRoot />
          </React.StrictMode>
        );
      }
    }
    disconnectedCallback() {
      this._mounted = false;
    }
  }
  customElements.define('customer-portal', CustomerPortal);
}
