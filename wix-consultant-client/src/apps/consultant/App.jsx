/**
 * Consultant Portal Router
 *
 * Routes:
 * - /consultant/login - Login page
 * - /consultant/register - Registration
 * - /consultant/dashboard - Main dashboard
 * - /consultant/profile - Profile editor
 * - /consultant/availability - Set availability
 * - /consultant/earnings - View earnings
 * - /consultant/calls - Call logs
 * - /consultant/settings - Settings
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ConsultantProtectedRoute from './components/ConsultantProtectedRoute';
import ConsultantLoading from './components/ConsultantLoading';
import './App.css';

const ConsultantLogin = lazy(() => import('./pages/ConsultantLoginPage'));
const ConsultantRegister = lazy(() => import('./pages/ConsultantRegisterPage'));
const ConsultantDashboard = lazy(() => import('./pages/ConsultantDashboardPage'));
const ConsultantProfile = lazy(() => import('./pages/ConsultantProfilePage'));
const ConsultantAvailability = lazy(() => import('./pages/ConsultantAvailabilityPage'));
const ConsultantEarnings = lazy(() => import('./pages/ConsultantEarningsPage'));
const ConsultantCalls = lazy(() => import('./pages/ConsultantCallsPage'));
const ConsultantSettings = lazy(() => import('./pages/ConsultantSettingsPage'));

function ConsultantApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if consultant is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('consultant_logged_in') === 'true';
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname.includes('/login') || location.pathname.includes('/register');

    // Redirect logic
    if (!isLoggedIn && !token && !isLoginPage) {
      navigate('/consultant/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Suspense fallback={<ConsultantLoading />}>
      <Routes>
        {/* Public routes - No auth required */}
        <Route path="/consultant/login" element={<ConsultantLogin />} />
        <Route path="/consultant/register" element={<ConsultantRegister />} />

        {/* Protected routes - Auth required */}
        <Route
          path="/consultant/dashboard"
          element={
            <ConsultantProtectedRoute>
              <ConsultantDashboard />
            </ConsultantProtectedRoute>
          }
        />

        <Route
          path="/consultant/profile"
          element={
            <ConsultantProtectedRoute>
              <ConsultantProfile />
            </ConsultantProtectedRoute>
          }
        />

        <Route
          path="/consultant/availability"
          element={
            <ConsultantProtectedRoute>
              <ConsultantAvailability />
            </ConsultantProtectedRoute>
          }
        />

        <Route
          path="/consultant/earnings"
          element={
            <ConsultantProtectedRoute>
              <ConsultantEarnings />
            </ConsultantProtectedRoute>
          }
        />

        <Route
          path="/consultant/calls"
          element={
            <ConsultantProtectedRoute>
              <ConsultantCalls />
            </ConsultantProtectedRoute>
          }
        />

        <Route
          path="/consultant/settings"
          element={
            <ConsultantProtectedRoute>
              <ConsultantSettings />
            </ConsultantProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/consultant/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/consultant/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default ConsultantApp;
