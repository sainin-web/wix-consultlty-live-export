/**
 * CONSULTLY WIDGET ENTRY POINT - OFFICIAL WIX CLIENT SDK
 *
 * Registers: <consultly-widget> custom element
 * Used by: Wix Site Page "Consultly"
 *
 * AUTHENTICATION ARCHITECTURE:
 * 1. Wix loads this custom element on the site
 * 2. createClient() initializes with Wix site context
 * 3. Wix injects current visitor/member access token into client.auth
 * 4. fetchWithAuth() includes token in all requests
 * 5. Backend receives Authorization header with Wix token
 * 6. Backend verifies token using Wix token-info API
 * 7. Backend extracts instanceId and resolves Consultly shop
 */

import "./localStoragePolyfill";
import React from "react";
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

// Official Wix Client SDK for self-managed custom elements
import { createClient } from "@wix/sdk";

function ConsultlyRoot({ wixClient }) {
  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <WixAuthProvider wixClient={wixClient}>
                <WixUserProvider>
                  <ConsultlyWidget wixClient={wixClient} />
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
/**
 * Self-managed Wix custom element
 * Wix site context is auto-detected by createClient()
 * Wix injects access token via client.auth
 */
class ConsultlyWidgetElement extends HTMLElement {
  constructor() {
    super();
    console.log("[CUSTOM-ELEMENT] consultly-widget constructed");
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    console.log("[CUSTOM-ELEMENT] consultly-widget connected to DOM");

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    // Initialize and mount React app with Wix Client
    this._initialize();
  }

  async _initialize() {
    try {
      // Create Wix Client
      // For self-managed elements on a Wix site, createClient() auto-detects
      // the site context and Wix injects the access token
      console.log("[WIX-CLIENT] Creating Wix client...");

      const wixClient = createClient({});

      console.log("[WIX-AUTH] Wix Client initialized");
      console.log("[WIX-AUTH] Client has fetchWithAuth method");

      // Verify that Wix has injected auth headers
      // This happens automatically when running on Wix
      const authHeaders = await wixClient.auth.getAuthHeaders();
      if (authHeaders && authHeaders.authorization) {
        console.log("[WIX-AUTH] ✓ Wix access token injected by Wix");
      }

      // Mount React app with the Wix Client
      // React components can now use wixClient.fetchWithAuth()
      this._reactRoot.render(
        <ConsultlyRoot wixClient={wixClient} />
      );

      console.log("[WIX-AUTH] ✓ React app mounted - ready to serve consultants");

    } catch (error) {
      console.error("[CUSTOM-ELEMENT] Failed to initialize:", error.message);

      // Render error state
      this._reactRoot.render(
        <div style={{ padding: "20px", color: "red" }}>
          Failed to initialize Consultly widget: {error.message}
        </div>
      );
    }
  }

  disconnectedCallback() {
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = null;
    }
    this._mounted = false;
    console.log("[CUSTOM-ELEMENT] consultly-widget disconnected");
  }
}

// ─── CUSTOM ELEMENT REGISTRATION ───────────────────────────────────────────
// Register as <consultly-widget> - do not change this tag name
if (!customElements.get("consultly-widget")) {
  customElements.define("consultly-widget", ConsultlyWidgetElement);
  console.log("[CUSTOM-ELEMENT] Registered: <consultly-widget>");
} else {
  console.log("[CUSTOM-ELEMENT] Already registered: <consultly-widget>");
}
