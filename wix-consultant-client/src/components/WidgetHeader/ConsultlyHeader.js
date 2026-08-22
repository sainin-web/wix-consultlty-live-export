/**
 * CONSULTLY HEADER - Lightweight Navigation
 * Shows three menu items: Home, Profile, Become a Consultant
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConsultlyHeader.css";

export default function ConsultlyHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("consultant_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("consultant_logged_in");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/home");
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <header className="consultly-header">
      <div className="consultly-header-container">
        <div className="consultly-header-nav">
          {/* HOME: Our Consultants */}
          <button
            className={`consultly-nav-item ${isActive("/home")}`}
            onClick={() => handleNavigation("/home")}
          >
            <span>Home</span>
          </button>

          {/* PROFILE */}
          {!isLoggedIn && (
            <button
              className={`consultly-nav-item ${isActive("/profile")}`}
              onClick={() => handleNavigation("/profile")}
            >
              <span>Profile</span>
            </button>
          )}

          {/* BECOME A CONSULTANT or DASHBOARD */}
          {isLoggedIn ? (
            <div className="consultly-nav-item-group">
              <button
                className="consultly-nav-item consultly-primary"
                onClick={() => handleNavigation("/consultant-dashboard")}
              >
                <span>Dashboard</span>
              </button>
              <button
                className="consultly-nav-logout"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              className="consultly-nav-item consultly-primary"
              onClick={() => handleNavigation("/login")}
            >
              <span>Become a Consultant</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
