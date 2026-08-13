/**
 * Customer Vouchers Page
 */

import React from 'react';
import { useSelector } from 'react-redux';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerVouchersPage.css';

function CustomerVouchersPage() {
  const wallet = useSelector((state) => state.wallet);
  const [vouchers] = React.useState([
    { id: 1, name: '100 Chat Minutes', balance: 45, total: 100, expires: '2026-12-31' },
    { id: 2, name: '50 Voice Minutes', balance: 12, total: 50, expires: '2026-09-30' },
    { id: 3, name: 'Unlimited 30 Days', balance: 30, total: 30, expires: '2026-08-30' },
  ]);

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>My Vouchers</h1>
        </div>

        <div className="vouchers-container">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="voucher-card">
              <div className="voucher-header">
                <h3>{voucher.name}</h3>
                <span className="expires">Expires {voucher.expires}</span>
              </div>

              <div className="voucher-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(voucher.balance / voucher.total) * 100}%` }}
                  />
                </div>
                <p className="progress-text">
                  {voucher.balance} / {voucher.total} minutes remaining
                </p>
              </div>

              <button className="btn-secondary">Use This Voucher</button>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ marginTop: '20px' }}>
          Buy More Vouchers
        </button>
      </main>
    </div>
  );
}

export default CustomerVouchersPage;
