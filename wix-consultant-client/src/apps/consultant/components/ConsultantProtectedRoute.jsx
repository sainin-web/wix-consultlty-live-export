/**
 * Protected route for consultant authenticated pages
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

function ConsultantProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('consultant_logged_in') === 'true';
  const token = localStorage.getItem('token');

  if (!isLoggedIn || !token) {
    return <Navigate to="/consultant/login" replace />;
  }

  return children;
}

export default ConsultantProtectedRoute;
