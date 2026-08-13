/**
 * Customer Wallet Page
 */

import React from 'react';
import { useSelector } from 'react-redux';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerWalletPage.css';

function CustomerWalletPage() {
  const wallet = useSelector((state) => state.wallet);

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>My Wallet</h1>
        </div>

        <div className="wallet-container">
          <div className="balance-card">
            <h2>Wallet Balance</h2>
            <p className="balance-amount">${wallet.balance.toFixed(2)}</p>
            <button className="btn-primary">Add Funds</button>
          </div>

          <div className="wallet-card">
            <h3>Wallet Information</h3>
            <div className="wallet-info">
              <p><strong>Account:</strong> {wallet.accountNumber || 'Not set'}</p>
              <p><strong>Status:</strong> Active</p>
              <p><strong>Currency:</strong> USD</p>
            </div>
          </div>
        </div>

        <div className="wallet-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">🎫 Buy Voucher</button>
            <button className="action-btn">💸 Withdraw</button>
            <button className="action-btn">📊 Statements</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerWalletPage;
