import React, { createContext, useContext } from "react";

/**
 * WixAuthContext - Manages authenticated Wix state
 * Provides: accessToken, instanceId, shopId, auth status
 */
const WixAuthContext = createContext(null);

export const WixAuthProvider = ({ children, authState }) => {
  return (
    <WixAuthContext.Provider value={authState}>
      {children}
    </WixAuthContext.Provider>
  );
};

/**
 * Hook to use Wix authentication state
 * Returns: { status, accessToken, instanceId, shopId, error }
 *
 * Status values:
 * - "loading": Auth check in progress
 * - "authenticated": Successfully authenticated with Wix
 * - "error": Authentication failed
 */
export const useWixAuth = () => {
  const context = useContext(WixAuthContext);
  if (!context) {
    throw new Error("useWixAuth must be used within WixAuthProvider");
  }
  return context;
};

/**
 * Get authorization header for API requests
 */
export const getWixAuthorizationHeader = (authState) => {
  if (!authState?.accessToken) return null;
  return `Bearer ${authState.accessToken}`;
};
