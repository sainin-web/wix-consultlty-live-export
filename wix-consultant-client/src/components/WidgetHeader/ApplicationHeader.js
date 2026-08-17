/**
 * Application Header - displayed inside the Wix widget
 * Provides navigation: Our Consultants, Profile, Become a Consultant
 * Replaces traditional app header navigation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ApplicationHeader.css';

export default function ApplicationHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if consultant is logged in
    const loggedIn = localStorage.getItem('consultant_logged_in') === 'true';
    setIsLoggedIn(loggedIn);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('consultant_logged_in');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/consultant/card');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <header className="application-header">
      <div className="app-header-container">
        <div className="app-header-nav">
          {/* Our Consultants */}
          <button
            className={`header-nav-item ${isActive('/consultant/card')}`}
            onClick={() => handleNavigation('/consultant/card')}
          >
            <span>Our Consultants</span>
          </button>

          {/* Profile - always visible for customers */}
          {!isLoggedIn && (
            <button
              className={`header-nav-item ${isActive('/profile')}`}
              onClick={() => handleNavigation('/profile')}
            >
              <span>Profile</span>
            </button>
          )}

          {/* Become a Consultant / Dashboard */}
          {isLoggedIn ? (
            <div className="header-nav-item-group">
              <button
                className="header-nav-item header-primary"
                onClick={() => handleNavigation('/consultant-dashboard')}
              >
                <span>Dashboard</span>
              </button>
              <button
                className="header-nav-logout"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              className="header-nav-item header-primary"
              onClick={() => handleNavigation('/login')}
            >
              <span>Become a Consultant</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
