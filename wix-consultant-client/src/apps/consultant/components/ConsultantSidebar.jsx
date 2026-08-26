/**
 * Consultant Dashboard Sidebar
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/consultantStore';
import '../styles/ConsultantSidebar.css';

function ConsultantSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    console.log('[CONSULTANT-SIDEBAR] Logging out...');
    // Clear Redux state
    dispatch(logout());
    // Redirect to login
    navigate('/consultant/login', { replace: true });
  };

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
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default ConsultantSidebar;
