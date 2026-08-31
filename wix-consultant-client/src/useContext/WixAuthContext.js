import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * WixAuthContext - Provides Wix Client with readiness state
 *
 * Contract:
 * - wixClient: Wix SDK client instance with fetchWithAuth() method
 * - isReady: true when Wix has injected the access token
 * - error: error message if initialization failed
 *
 * The Wix Client handles authentication:
 * - Wix automatically injects current visitor/member access token
 * - fetchWithAuth() includes token in Authorization header
 * - Backend receives verified Authorization header
 */
const WixAuthContext = createContext({
  wixClient: null,
  isReady: false,
  error: null,
});

export const WixAuthProvider = ({ children, wixClient }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wixClient) {
      console.warn("[WIX-AUTH-CONTEXT] wixClient not provided");
      setError("Wix Client initialization failed");
      return;
    }

    // Mark as ready immediately - Wix handles token injection internally
    console.log("[WIX-AUTH-CONTEXT] ✓ Wix Client ready");
    setIsReady(true);
  }, [wixClient]);

  const value = {
    wixClient,
    isReady,
    error,
  };

  return (
    <WixAuthContext.Provider value={value}>
      {children}
    </WixAuthContext.Provider>
  );
};

/**
 * Hook to use Wix Client for authenticated requests
 *
 * Returns: { wixClient, isReady, error }
 * - wixClient: Use wixClient.fetchWithAuth(url, options) for authenticated requests
 * - isReady: Wait for this before making requests
 * - error: Check this for initialization errors
 *
 * Usage in components:
 * const { wixClient, isReady, error } = useWixAuth();
 * if (!isReady) return <LoadingState />;
 * if (error) return <ErrorState />;
 * const response = await wixClient.fetchWithAuth('/api/consultant/wix-store-front');
 */
export const useWixAuth = () => {
  const context = useContext(WixAuthContext);
  if (!context || !context.wixClient) {
    throw new Error("useWixAuth must be used within WixAuthProvider");
  }
  return context;
};
