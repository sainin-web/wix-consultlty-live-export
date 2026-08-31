/**
 * CONSULTLY WIDGET ENTRY POINT
 *
 * Registers: <consultly-widget> custom element
 * Used by: Wix App Page "Consultly" in Wix storefront
 *
 * ARCHITECTURE:
 * 1. Custom element mounts
 * 2. Initialize Wix Client for authentication
 * 3. Get Wix access token
 * 4. Mount React app with authenticated context
 * 5. React fetches consultants with verified auth
 */

import "./localStoragePolyfill";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ConsultlyWidget from "./ConsultlyWidget";
import "./index.css";
import "@shopify/polaris/build/esm/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./components/Redux/store/store";
import ToastProvider from "./components/AlertModel/ToastProvider";
import { WixUserProvider } from "./useContext/WixUserContext";
import { WixAuthProvider } from "./useContext/WixAuthContext";

/**
 * Wix Client Auth Context
 * Manages Wix authentication state for the entire widget
 */
function WixAuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    status: "loading", // loading | authenticated | error
    accessToken: null,
    instanceId: null,
    shopId: null,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[WIX-AUTH] Initializing Wix authentication...");

        // In a Wix App Page context, Wix handles authentication.
        // We need to get the access token from Wix and verify it with our backend.
        const backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:3500';

        // Method 1: Try to get verified context from backend
        // When running in Wix, requests to our backend include auth headers automatically
        try {
          console.log("[WIX-AUTH] Calling /api/wix-context for authenticated context...");
          const response = await fetch(`${backendHost}/api/wix-context`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.accessToken && data.shopId) {
              console.log("[WIX-AUTH] ✓ Authenticated via backend");
              console.log("[WIX-AUTH] instanceId:", data.instanceId);
              console.log("[WIX-AUTH] shopId:", data.shopId);

              localStorage.setItem('wix_access_token', data.accessToken);
              localStorage.setItem('wix_id', data.shopId);

              setAuthState({
                status: "authenticated",
                accessToken: data.accessToken,
                instanceId: data.instanceId,
                shopId: data.shopId,
                error: null,
              });
              return;
            }
          }
        } catch (err) {
          console.warn("[WIX-AUTH] Backend /api/wix-context call failed:", err.message);
        }

        // Method 2: Check localStorage (from previous session)
        const cachedToken = localStorage.getItem('wix_access_token');
        const cachedShopId = localStorage.getItem('wix_id');
        if (cachedToken && cachedShopId) {
          console.log("[WIX-AUTH] ✓ Using cached token from localStorage");
          setAuthState({
            status: "authenticated",
            accessToken: cachedToken,
            instanceId: cachedShopId,
            shopId: cachedShopId,
            error: null,
          });
          return;
        }

        // If we get here, auth failed
        console.error("[WIX-AUTH] ✗ Failed to obtain Wix authentication");
        setAuthState(prev => ({
          ...prev,
          status: "error",
          error: "Failed to obtain Wix authentication",
        }));

      } catch (error) {
        console.error("[WIX-AUTH] Authentication error:", error);
        setAuthState(prev => ({
          ...prev,
          status: "error",
          error: error.message,
        }));
      }
    };

    initializeAuth();
  }, []);

  // Provide auth state through context or props
  const contextValue = React.createContext(authState);
  return (
    <contextValue.Provider value={authState}>
      {children}
    </contextValue.Provider>
  );
}

function ConsultlyRoot({ authState }) {
  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <WixAuthProvider authState={authState}>
                <WixUserProvider>
                  <ConsultlyWidget authState={authState} />
                </WixUserProvider>
              </WixAuthProvider>
            </BrowserRouter>
          </Provider>
        </ToastProvider>
      </PolarisAppProvider>
    </React.StrictMode>
  );
}

// ─── CONSULTLY CUSTOM ELEMENT ───────────────────────────────────────────────
class ConsultlyWidgetElement extends HTMLElement {
  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    console.log("[CONSULTLY] Custom element mounted");

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    // Mount app with Wix authentication
    this._renderApp();
  }

  async _renderApp() {
    try {
      // Initialize Wix authentication
      const backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:3500';

      console.log("[WIX-AUTH] Obtaining Wix authenticated context...");

      // Call backend to get verified context
      const response = await fetch(`${backendHost}/api/wix-context`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let authState = {
        status: "error",
        accessToken: null,
        instanceId: null,
        shopId: null,
        error: "Authentication failed",
      };

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.accessToken) {
          console.log("[WIX-AUTH] ✓ Authenticated successfully");
          console.log("[WIX-AUTH] instanceId:", data.instanceId);
          console.log("[WIX-AUTH] shopId:", data.shopId);

          localStorage.setItem('wix_access_token', data.accessToken);
          localStorage.setItem('wix_id', data.shopId);

          authState = {
            status: "authenticated",
            accessToken: data.accessToken,
            instanceId: data.instanceId,
            shopId: data.shopId,
            error: null,
          };
        } else {
          console.log("[WIX-AUTH] Backend returned: ", data.message || "unknown error");
          authState.error = data.message || "Authentication failed";
        }
      } else {
        console.log("[WIX-AUTH] Backend request failed with status:", response.status);
        authState.error = `HTTP ${response.status}`;
      }

      // Check localStorage as fallback
      if (authState.status !== "authenticated") {
        const cachedToken = localStorage.getItem('wix_access_token');
        const cachedShopId = localStorage.getItem('wix_id');
        if (cachedToken && cachedShopId) {
          console.log("[WIX-AUTH] Using cached token from localStorage");
          authState = {
            status: "authenticated",
            accessToken: cachedToken,
            instanceId: cachedShopId,
            shopId: cachedShopId,
            error: null,
          };
        }
      }

      // Render app with auth state
      this._reactRoot.render(
        <ConsultlyRoot authState={authState} />
      );

    } catch (error) {
      console.error("[WIX-AUTH] Error during authentication:", error);

      this._reactRoot.render(
        <ConsultlyRoot authState={{
          status: "error",
          accessToken: null,
          instanceId: null,
          shopId: null,
          error: error.message,
        }} />
      );
    }
  }

  disconnectedCallback() {
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = null;
    }
    this._mounted = false;
    console.log("[CONSULTLY] Custom element disconnected");
  }
}

// Register custom element - prevent duplicate registration
if (!customElements.get("consultly-widget")) {
  customElements.define("consultly-widget", ConsultlyWidgetElement);
  console.log("[CONSULTLY] Custom element registered: <consultly-widget>");
} else {
  console.log("[CONSULTLY] Custom element already registered");
}
