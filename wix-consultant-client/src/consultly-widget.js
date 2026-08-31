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
 * - accessTokenListener exposes Wix's injector function
 * - Wix calls this to inject visitor/member access token
 * - fetchWithAuth() uses the injected token for backend requests
 */
class ConsultlyWidgetElement extends HTMLElement {
  constructor() {
    super();
    console.log("[CUSTOM-ELEMENT] consultly-widget constructed");

    // CRITICAL: Initialize Wix Client in constructor so accessTokenListener
    // is ready before connectedCallback. This must happen early.
    this._initializeWixClient();
  }

  _initializeWixClient() {
    try {
      console.log("[WIX-CLIENT] Creating Wix Client with Site authentication...");

      // Official Wix pattern for self-managed custom elements:
      // 1. site.auth() - provides Wix's automatic token injection
      // 2. site.host() - configures Wix host with app ID
      this.wixClient = createClient({
        auth: site.auth(),
        host: site.host({
          applicationId: WIX_APP_ID,
        }),
      });

      console.log("[WIX-AUTH] Wix Client created");

      // CRITICAL: Expose Wix's access token injector
      // Wix calls this function to inject the access token into the client
      // Without this, Wix has no way to pass the token to our custom element
      this.accessTokenListener = this.wixClient.auth.getAccessTokenInjector();
      console.log("[WIX-AUTH] ✓ Access token listener registered");
      console.log("[WIX-AUTH] Waiting for Wix to inject access token...");
    } catch (error) {
      console.error("[WIX-CLIENT] Failed to create Wix Client:", error.message);
      this.wixClient = null;
    }
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    console.log("[CUSTOM-ELEMENT] consultly-widget connected to DOM");

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    // Mount React app with Wix Client
    this._mountReact();
  }

  _mountReact() {
    try {
      if (!this.wixClient) {
        throw new Error("Wix Client not initialized");
      }

      console.log("[WIX-AUTH] ✓ Wix Client ready - mounting React app");

      // Mount React app with the Wix Client
      // React components will use wixClient.fetchWithAuth() for authenticated requests
      this._reactRoot.render(
        <ConsultlyRoot wixClient={this.wixClient} />
      );

      console.log("[CUSTOM-ELEMENT] ✓ React app mounted - Wix will inject token now");

    } catch (error) {
      console.error("[CUSTOM-ELEMENT] ✗ Failed to mount React:", error.message);
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
