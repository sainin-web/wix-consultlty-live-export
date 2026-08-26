/**
 * Storefront App Router
 *
 * ONLY includes public marketplace routes.
 * Routes:
 * - /consultant/card — Consultant listing (main marketplace)
 * - /view-profile/:shop_id/:consultant_id — Consultant profile
 *
 * DOES NOT include:
 * - Admin routes
 * - Consultant dashboard routes
 * - Customer/member routes
 * - Authentication routes
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StorefrontShellMinimal from './components/StorefrontShellMinimal';
import StorefrontLoading from './components/StorefrontLoading';
import { perfMark, perfMeasure } from './utils/performanceMonitor';
import './App.css';

// Lazy-load only marketplace components
const ConsultantListing = lazy(() => import('./pages/ConsultantListingPage'));
const ConsultantProfile = lazy(() => import('./pages/ConsultantProfilePage'));

/**
 * StorefrontApp: Routes for public marketplace only.
 */
function StorefrontApp() {
  console.log('🔵🔵🔵 [STOREFRONT-APP] RENDERING ROUTES 🔵🔵🔵');

  useEffect(() => {
    console.log('🔵 [STOREFRONT-APP] MOUNTED - Setting up routes');
    perfMark('storefront-app-component-mount');
  }, []);

  return (
    <Suspense fallback={<StorefrontLoading />}>
      <Routes>
        {/* Main consultant marketplace */}
        <Route
          path="/consultant/card"
          element={
            <>
              <div style={{position: 'fixed', top: '10px', left: '10px', background: 'yellow', padding: '10px', zIndex: 9999, fontWeight: 'bold'}}>
                ROUTE MATCHED: /consultant/card
              </div>
              <StorefrontShellMinimal>
                <ConsultantListing />
              </StorefrontShellMinimal>
            </>
          }
        />

        {/* Consultant profile view */}
        <Route
          path="/view-profile/:shop_id/:consultant_id"
          element={
            <StorefrontShellMinimal>
              <ConsultantProfile />
            </StorefrontShellMinimal>
          }
        />

        {/* Default redirect to marketplace */}
        <Route path="/" element={<Navigate to="/consultant/card" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/consultant/card" replace />} />
      </Routes>
    </Suspense>
  );
}

export default StorefrontApp;
