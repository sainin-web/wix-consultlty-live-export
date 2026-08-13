/**
 * Customer Portal Sidebar
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/CustomerSidebar.css';

function CustomerSidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <aside className="customer-sidebar">
      <div className="customer-sidebar-header">
        <h2>Member Area</h2>
      </div>

      <nav className="customer-sidebar-nav">
        <Link
          to="/member/profile"
          className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
        >
          👤 Profile
        </Link>

        <Link
          to="/member/wallet"
          className={`sidebar-link ${isActive('/wallet') ? 'active' : ''}`}
        >
          💰 Wallet
        </Link>

        <Link
          to="/member/vouchers"
          className={`sidebar-link ${isActive('/vouchers') ? 'active' : ''}`}
        >
          🎟️ Vouchers
        </Link>

        <Link
          to="/member/calls"
          className={`sidebar-link ${isActive('/calls') ? 'active' : ''}`}
        >
          📞 Upcoming Calls
        </Link>

        <Link
          to="/member/history"
          className={`sidebar-link ${isActive('/history') ? 'active' : ''}`}
        >
          📜 Call History
        </Link>

        <Link
          to="/member/transactions"
          className={`sidebar-link ${isActive('/transactions') ? 'active' : ''}`}
        >
          📊 Transactions
        </Link>
      </nav>

      <div className="customer-sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('wixLoggedIn');
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default CustomerSidebar;
