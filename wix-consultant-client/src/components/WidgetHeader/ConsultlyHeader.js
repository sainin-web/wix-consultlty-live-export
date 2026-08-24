import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConsultlyHeader.css";

export default function ConsultlyHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("consultant_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("consultant_logged_in");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/home");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <header className="consultly-header">
      <div className="consultly-header-container">
        {/* LOGO SECTION */}
        <div className="consultly-logo-section">
          <div className="consultly-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#4a90e2"/>
              <text x="50%" y="50%" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" dominantBaseline="middle">C</text>
            </svg>
            <span className="consultly-brand">Consultly</span>
          </div>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="consultly-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* NAVIGATION SECTION */}
        <nav className={`consultly-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <button
            className={`consultly-nav-item ${isActive("/home")}`}
            onClick={() => handleNavigation("/home")}
          >
            Home
          </button>

          {!isLoggedIn && (
            <button
              className={`consultly-nav-item ${isActive("/profile")}`}
              onClick={() => handleNavigation("/profile")}
            >
              My Profile
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                className={`consultly-nav-item ${isActive("/consultant-dashboard")}`}
                onClick={() => handleNavigation("/consultant-dashboard")}
              >
                Dashboard
              </button>
              <button className="consultly-nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="consultly-nav-item consultly-primary"
              onClick={() => handleNavigation("/login")}
            >
              Become Consultant
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
