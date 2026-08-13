/**
 * Consultant Dashboard Sidebar
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/ConsultantSidebar.css';

function ConsultantSidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <aside className="consultant-sidebar">
      <div className="consultant-sidebar-header">
        <h2>Consultant Portal</h2>
      </div>

      <nav className="consultant-sidebar-nav">
        <Link
          to="/consultant/dashboard"
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/consultant/profile"
          className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
        >
          👤 Profile
        </Link>

        <Link
          to="/consultant/availability"
          className={`sidebar-link ${isActive('/availability') ? 'active' : ''}`}
        >
          📅 Availability
        </Link>

        <Link
          to="/consultant/earnings"
          className={`sidebar-link ${isActive('/earnings') ? 'active' : ''}`}
        >
          💰 Earnings
        </Link>

        <Link
          to="/consultant/calls"
          className={`sidebar-link ${isActive('/calls') ? 'active' : ''}`}
        >
          📞 Calls
        </Link>

        <Link
          to="/consultant/settings"
          className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
        >
          ⚙️ Settings
        </Link>
      </nav>

      <div className="consultant-sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('consultant_logged_in');
            localStorage.removeItem('token');
            window.location.href = '/consultant/login';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default ConsultantSidebar;
