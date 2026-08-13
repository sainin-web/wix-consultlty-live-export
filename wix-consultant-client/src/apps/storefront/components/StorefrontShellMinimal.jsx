/**
 * STOREFRONT SHELL (Minimal)
 *
 * Renders marketplace page shell WITHOUT:
 * - Wix header (Wix owns the header)
 * - Duplicate navigation
 * - Global providers
 * - Status checks that block rendering
 *
 * This shell:
 * - Provides container for marketplace
 * - Handles instance guard minimally
 * - Allows immediate render
 */

import React, { useEffect, useState } from 'react';
import { perfMark } from '../utils/performanceMonitor';
import './StorefrontShellMinimal.css';

function StorefrontShellMinimal({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    perfMark('storefront-shell-mount');

    // Check for Wix instance (minimal check, non-blocking)
    const instance = new URLSearchParams(window.location.search).get('instance') ||
      localStorage.getItem('wix_instance');

    if (!instance) {
      // Don't block on this - storefront can still load
      console.warn('[STOREFRONT] No Wix instance in URL or storage');
      // Could set error, but allowing render anyway for now
    }

    // Immediately set ready (no API calls, no blocking)
    setReady(true);
  }, []);

  if (error) {
    return (
      <div className="storefront-error" role="alert">
        <h2>Error Loading Marketplace</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="storefront-loading">
        <div className="loading-spinner" />
        <p>Preparing marketplace...</p>
      </div>
    );
  }

  return (
    <div className="storefront-container">
      <main className="storefront-main" role="main">
        {children}
      </main>
    </div>
  );
}

export default StorefrontShellMinimal;
