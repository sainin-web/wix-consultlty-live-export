/**
 * CONSULTLY WIDGET ENTRY POINT - SELF-MANAGED WIX CUSTOM ELEMENT
 *
 * Registers: <consultly-widget> custom element
 * Used by: Wix Site Page "Consultly"
 *
 * OFFICIAL WIX AUTHENTICATION ARCHITECTURE:
 * 1. Wix loads this custom element on the site
 * 2. site.auth() and site.host() provide Wix-managed authentication
 * 3. createClient() initializes with Site host context
 * 4. Wix injects current visitor/member access token automatically
 * 5. fetchWithAuth() includes Wix access token in all requests
 * 6. Backend receives Authorization header with verified Wix token
 * 7. Backend verifies token and extracts instanceId
 * 8. Backend resolves Consultly shop by verified instanceId
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

// Official Wix Client SDK with Site host authentication
import { createClient } from "@wix/sdk";
import { site } from "@wix/site";

// Wix app ID (from Wix Dev Center)
const WIX_APP_ID = "e87fc4f0-d74b-463f-ad77-b813eec84846";

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
 *
 * Official Wix pattern:
 * - site.auth() provides Wix's token injection mechanism
 * - site.host() configures the Wix host context with app ID
 * - Wix automatically injects visitor/member access token
 * - fetchWithAuth() uses the injected token for backend requests
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
      console.log("[WIX-CLIENT] Initializing Wix Client with Site host context...");

      // Official Wix pattern for self-managed custom elements:
      // 1. site.auth() - provides Wix's automatic token injection
      // 2. site.host() - configures Wix host with app ID
      const wixClient = createClient({
        auth: site.auth(),
        host: site.host({
          applicationId: WIX_APP_ID,
        }),
      });

      console.log("[WIX-AUTH] Wix Client initialized with Site host authentication");
      console.log("[WIX-AUTH] Wix will inject access token automatically");

      // Mount React app with the Wix Client
      // React components will use wixClient.fetchWithAuth() for authenticated requests
      this._reactRoot.render(
        <ConsultlyRoot wixClient={wixClient} />
      );

      console.log("[CUSTOM-ELEMENT] ✓ React app mounted - waiting for Wix token injection");

    } catch (error) {
      console.error("[CUSTOM-ELEMENT] ✗ Initialization failed:", error.message);
      console.error("[CUSTOM-ELEMENT] Details:", error);

      // Render error state
      this._reactRoot.render(
        <div style={{ padding: "20px", color: "red" }}>
          <strong>Failed to initialize Consultly widget</strong>
          <br />
          {error.message}
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
// Register as <consultly-widget> - MUST NOT change this tag name
if (!customElements.get("consultly-widget")) {
  customElements.define("consultly-widget", ConsultlyWidgetElement);
  console.log("[CUSTOM-ELEMENT] ✓ Registered: <consultly-widget>");
} else {
  console.log("[CUSTOM-ELEMENT] Already registered: <consultly-widget>");
}
