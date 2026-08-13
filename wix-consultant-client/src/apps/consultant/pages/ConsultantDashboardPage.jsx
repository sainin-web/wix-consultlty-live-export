/**
 * Consultant Dashboard Main Page
 */

import React from 'react';
import { useSelector } from 'react-redux';
import ConsultantSidebar from '../components/ConsultantSidebar';
import '../styles/ConsultantDashboardPage.css';

function ConsultantDashboardPage() {
  const auth = useSelector((state) => state.auth);
  const earnings = useSelector((state) => state.earnings);

  return (
    <div className="consultant-dashboard">
      <ConsultantSidebar />

      <main className="consultant-main">
        <div className="consultant-header">
          <h1>Welcome back, {auth.user?.email || 'Consultant'}</h1>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Earnings Balance</h3>
            <p className="big-number">${earnings.balance.toFixed(2)}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Earnings</h3>
            <p className="big-number">${earnings.totalEarnings.toFixed(2)}</p>
          </div>

          <div className="dashboard-card">
            <h3>Status</h3>
            <p className="status-badge online">🟢 Online</p>
          </div>

          <div className="dashboard-card">
            <h3>This Month</h3>
            <p className="big-number">
              {earnings.transactions?.filter(
                (t) => new Date(t.date).getMonth() === new Date().getMonth()
              ).length || 0}
            </p>
            <small>transactions</small>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">Update Profile</button>
            <button className="action-btn">Set Availability</button>
            <button className="action-btn">View Earnings</button>
            <button className="action-btn">Call History</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConsultantDashboardPage;
