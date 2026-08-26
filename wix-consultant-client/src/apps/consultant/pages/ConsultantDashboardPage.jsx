/**
 * Consultant Dashboard Main Page
 */

import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/ConsultantDashboardPage.css';

function ConsultantDashboardPage() {
  const { consultantOverview } = useSelector((state) => state.consultants);
  const consultant = consultantOverview?.consultant || {};
  const displayEmail = consultant?.email || localStorage.getItem("consultant_display_email") || "Consultant";
  const walletBalance = consultant?.walletBalance || 0;

  return (
    <>
      <div className="consultant-header">
        <h1>Welcome back, {displayEmail}</h1>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Wallet Balance</h3>
          <p className="big-number">${walletBalance.toFixed(2)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Status</h3>
          <p className="status-badge online">🟢 Active</p>
        </div>

        <div className="dashboard-card">
          <h3>Phone</h3>
          <p className="status-badge">{consultant?.phone || "Not provided"}</p>
        </div>

        <div className="dashboard-card">
          <h3>Profession</h3>
          <p className="status-badge">{consultant?.profession || "Not specified"}</p>
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
    </>
  );
}

export default ConsultantDashboardPage;
