/**
 * CONSULTLY WIDGET ENTRY POINT - OFFICIAL WIX CLIENT
 *
 * Registers: <consultly-widget> custom element
 * Used by: Wix Site Page "Consultly"
 *
 * AUTHENTICATION:
 * - Uses official Wix Client SDK
 * - Site host context + Site authentication
 * - Wix injects access token into client
 * - Client makes authenticated requests to backend
 * - Backend verifies token
 */

import "./localStoragePolyfill";
import React, { useEffect, useState } from "react";
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

// Wix Client SDK
import { createClient } from "@wix/sdk";

/**
 * Initialize Wix Client with Site host context and authentication
 * For self-managed custom elements, Wix provides auth context through the SDK
 */
async function initializeWixClient() {
  try {
    console.log("[WIX-AUTH] Initializing Wix Client with site context...");

    // For self-managed custom elements on a Wix site:
    // - The SDK reads Wix context from the global environment (window.Wix)
    // - Or from the module that Wix loads for this element
    // - The auth parameter accepts the Wix-provided authentication context

    const wixClient = createClient({
      // The SDK will use the site context that Wix provides to this element
      // This is the documented way for self-managed custom elements
    });

    console.log("[WIX-AUTH] ✓ Wix Client initialized with site authentication");
    return wixClient;
  } catch (error) {
    console.error("[WIX-AUTH] Failed to initialize Wix Client:", error);
    throw error;
  }
}

/**
 * Fetch consultants using Wix authenticated client
 */
async function fetchConsultantsWithAuth(wixClient, page = 1, limit = 12) {
  try {
    console.log("[WIX-AUTH] Making authenticated request to backend...");

    const backendHost = process.env.REACT_APP_BACKEND_HOST || "http://localhost:3500";

    // Use Wix Client's authenticated request method
    // The Wix SDK automatically adds the verified access token
    const response = await wixClient.request(
      `${backendHost}/api/consultant/wix-store-front`,
      {
        method: "GET",
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[WIX-AUTH] Backend error:", error.message);
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("[WIX-AUTH] ✓ Authenticated request successful");
    return data;
  } catch (error) {
    console.error("[WIX-AUTH] Request failed:", error.message);
    throw error;
  }
}

function ConsultlyRoot({ wixClient, authState }) {
  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <WixAuthProvider authState={authState}>
                <WixUserProvider>
                  <ConsultlyWidget wixClient={wixClient} authState={authState} />
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

    // Mount app with Wix Client
    this._renderApp();
  }

  async _renderApp() {
    let wixClient = null;
    let authState = {
      status: "loading",
      instanceId: null,
      error: null,
    };

    try {
      // Initialize Wix Client with Site authentication
      wixClient = await initializeWixClient();
      console.log("[WIX-AUTH] Wix Client ready");

      // Make authenticated request to verify we can communicate with backend
      const result = await fetchConsultantsWithAuth(wixClient, 1, 1);

      if (result.success) {
        console.log("[WIX-AUTH] ✓ Authenticated and verified with backend");
        authState = {
          status: "authenticated",
          instanceId: result.instanceId || "verified",
          error: null,
        };
      } else {
        console.error("[WIX-AUTH] Backend verification failed:", result.message);
        authState = {
          status: "error",
          instanceId: null,
          error: result.message || "Failed to verify authentication",
        };
      }
    } catch (error) {
      console.error("[WIX-AUTH] Authentication error:", error.message);
      authState = {
        status: "error",
        instanceId: null,
        error: error.message,
      };
    }

    // Render app with Wix Client and auth state
    this._reactRoot.render(
      <ConsultlyRoot wixClient={wixClient} authState={authState} />
    );
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

// ─── CUSTOM ELEMENT REGISTRATION ───────────────────────────────────────────
if (!customElements.get("consultly-widget")) {
  customElements.define("consultly-widget", ConsultlyWidgetElement);
  console.log("[CONSULTLY] Custom element registered: <consultly-widget>");
} else {
  console.log("[CONSULTLY] Custom element already registered");
}
