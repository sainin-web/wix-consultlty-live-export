/**
 * Customer Portal Router
 *
 * Routes:
 * - /member/profile - Profile info
 * - /member/wallet - Wallet/balance
 * - /member/vouchers - Purchased vouchers
 * - /member/history - Call history
 * - /member/calls - Upcoming calls
 * - /member/transactions - Transaction history
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import CustomerLoading from './components/CustomerLoading';
import './App.css';

const CustomerProfile = lazy(() => import('./pages/CustomerProfilePage'));
const CustomerWallet = lazy(() => import('./pages/CustomerWalletPage'));
const CustomerVouchers = lazy(() => import('./pages/CustomerVouchersPage'));
const CustomerHistory = lazy(() => import('./pages/CustomerHistoryPage'));
const CustomerCalls = lazy(() => import('./pages/CustomerCallsPage'));
const CustomerTransactions = lazy(() => import('./pages/CustomerTransactionsPage'));

function CustomerApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if customer is logged in (Wix member)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('wixLoggedIn') === 'true';
    const isMemberPath = location.pathname.includes('/member');

    if (!isLoggedIn && isMemberPath) {
      navigate('/member/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Suspense fallback={<CustomerLoading />}>
      <Routes>
        {/* Protected routes - Member auth required */}
        <Route
          path="/member/profile"
          element={
            <CustomerProtectedRoute>
              <CustomerProfile />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/member/wallet"
          element={
            <CustomerProtectedRoute>
              <CustomerWallet />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/member/vouchers"
          element={
            <CustomerProtectedRoute>
              <CustomerVouchers />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/member/history"
          element={
            <CustomerProtectedRoute>
              <CustomerHistory />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/member/calls"
          element={
            <CustomerProtectedRoute>
              <CustomerCalls />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/member/transactions"
          element={
            <CustomerProtectedRoute>
              <CustomerTransactions />
            </CustomerProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/member/profile" replace />} />
        <Route path="*" element={<Navigate to="/member/profile" replace />} />
      </Routes>
    </Suspense>
  );
}

export default CustomerApp;
