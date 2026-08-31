import React, { createContext, useContext } from "react";

/**
 * WixAuthContext - Provides Wix Client for authenticated requests
 *
 * The Wix Client handles authentication automatically:
 * - client.fetchWithAuth() includes Wix access token in requests
 * - Wix injects the current visitor/member token
 * - Backend receives Authorization header with token
 * - Backend verifies token using Wix APIs
 */
const WixAuthContext = createContext(null);

export const WixAuthProvider = ({ children, wixClient }) => {
  if (!wixClient) {
    console.warn("[WIX-AUTH] WixAuthProvider: wixClient is null");
  }

  return (
    <WixAuthContext.Provider value={wixClient}>
      {children}
    </WixAuthContext.Provider>
  );
};

/**
 * Hook to use Wix Client for authenticated requests
 * Returns: wixClient with fetchWithAuth() method
 *
 * Usage in components:
 * const wixClient = useWixAuth();
 * const response = await wixClient.fetchWithAuth('/api/consultant/wix-store-front');
 */
export const useWixAuth = () => {
  const wixClient = useContext(WixAuthContext);
  if (!wixClient) {
    throw new Error("useWixAuth must be used within WixAuthProvider");
  }
  return wixClient;
};
