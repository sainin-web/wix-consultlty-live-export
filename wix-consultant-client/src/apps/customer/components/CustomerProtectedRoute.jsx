/**
 * Protected route for customer authenticated pages
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

function CustomerProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('wixLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/member/login" replace />;
  }

  return children;
}

export default CustomerProtectedRoute;
