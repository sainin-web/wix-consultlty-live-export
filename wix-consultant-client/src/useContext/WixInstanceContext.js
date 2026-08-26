import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * WixInstanceContext - Manages Wix instance/shop context
 * Provides instance token and shop_id throughout the app
 * Handles async delivery of Wix context from Wix page
 */

const WixInstanceContext = createContext(null);

export const WixInstanceProvider = ({ children }) => {
  const [instance, setInstance] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [isContextReady, setIsContextReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize from existing sources (URL, localStorage)
   * Listen for async Wix context via postMessage
   */
  useEffect(() => {
    console.log("[WIX-INSTANCE-CONTEXT] Initializing instance context...");

    const resolveInitialInstance = () => {
      // Try URL params first
      const urlInstance = new URLSearchParams(window.location.search).get("instance");
      if (urlInstance) {
        console.log("[WIX-INSTANCE-CONTEXT] Found instance in URL");
        return urlInstance;
      }

      // Try localStorage (might have been set by custom element)
      const storedInstance = localStorage.getItem("wix_instance");
      if (storedInstance) {
        console.log("[WIX-INSTANCE-CONTEXT] Found instance in localStorage");
        return storedInstance;
      }

      return null;
    };

    const resolveInitialShopId = () => {
      return localStorage.getItem("wix_id") || null;
    };

    // Set initial instance and shop_id
    const initialInstance = resolveInitialInstance();
    const initialShopId = resolveInitialShopId();

    if (initialInstance) {
      setInstance(initialInstance);
      console.log("[WIX-INSTANCE-CONTEXT] Initial instance:", initialInstance.slice(0, 20) + "...");
      setIsContextReady(true);
    }

    if (initialShopId) {
      setShopId(initialShopId);
      console.log("[WIX-INSTANCE-CONTEXT] Initial shop_id:", initialShopId);
    }

    setIsLoading(false);

    /**
     * Listen for Wix postMessage with instance
     * This handles delayed context delivery from Wix page
     */
    const handleWixMessage = (event) => {
      const data = event.data;

      if (!data || typeof data !== "object") return;

      // Handle instance in postMessage
      const receivedInstance = data.instance || data.wixInstance || data.payload?.instance;

      if (receivedInstance && typeof receivedInstance === "string") {
        console.log("[WIX-INSTANCE-CONTEXT] Instance received from postMessage:", receivedInstance.slice(0, 20) + "...");
        localStorage.setItem("wix_instance", receivedInstance);
        setInstance(receivedInstance);
        setIsContextReady(true);
      }

      // Handle shop_id in postMessage
      const receivedShopId = data.shopId || data.shop_id || data.wix_id;
      if (receivedShopId && typeof receivedShopId === "string") {
        console.log("[WIX-INSTANCE-CONTEXT] Shop ID received from postMessage:", receivedShopId);
        localStorage.setItem("wix_id", receivedShopId);
        setShopId(receivedShopId);
      }
    };

    /**
     * Listen for custom element attribute changes
     * The custom element updates localStorage when instance attribute changes
     * We listen for storage events to detect those changes
     */
    const handleStorageChange = (event) => {
      if (event.key === "wix_instance" && event.newValue) {
        console.log("[WIX-INSTANCE-CONTEXT] Instance updated via storage:", event.newValue.slice(0, 20) + "...");
        setInstance(event.newValue);
        setIsContextReady(true);
      }

      if (event.key === "wix_id" && event.newValue) {
        console.log("[WIX-INSTANCE-CONTEXT] Shop ID updated via storage:", event.newValue);
        setShopId(event.newValue);
      }
    };

    window.addEventListener("message", handleWixMessage);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("message", handleWixMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value = {
    instance,
    shopId,
    isContextReady,
    isLoading,
    // Helper methods
    hasContext: () => !!instance && !!shopId && isContextReady,
    getAuthorizationHeader: () => instance ? `Bearer ${instance}` : null,
  };

  return (
    <WixInstanceContext.Provider value={value}>
      {children}
    </WixInstanceContext.Provider>
  );
};

/**
 * Hook to use Wix instance context
 * Returns { instance, shopId, isContextReady, isLoading, hasContext, getAuthorizationHeader }
 */
export const useWixInstance = () => {
  const context = useContext(WixInstanceContext);
  if (!context) {
    throw new Error("useWixInstance must be used within a WixInstanceProvider");
  }
  return context;
};
