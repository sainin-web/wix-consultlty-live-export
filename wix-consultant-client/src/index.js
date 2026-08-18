/**
 * PUBLIC WIDGET ENTRY POINT
 *
 * This file is ONLY for the public Wix Widget Custom Element.
 * It registers the <consultant-widget> custom element which loads the public app.
 *
 * IMPORTANT: This does NOT mount the admin dashboard.
 * The admin dashboard has its own separate entry point (admin-index.js).
 *
 * Do NOT add admin routes or admin UI here.
 */

// FIX 1 — Must be first import: installs in-memory localStorage before
// Agora SDK or any other module touches window.localStorage
import "./localStoragePolyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import PublicWidget from "./PublicWidget";
import "./index.css";
import "@shopify/polaris/build/esm/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./components/Redux/store/store";
import ToastProvider from "./components/AlertModel/ToastProvider";
import { AppStatusProvider } from "./components/ProtectRoute/AppStatusProvider";
import { WixUserProvider } from "./useContext/WixUserContext";
import { perfMark } from "./utils/performanceMonitor";

// ─── Shared React tree ───────────────────────────────────────────────────────
function RootApp({ instanceId, embeddedInWidget = false }) {
  React.useEffect(() => {
    perfMark('public-widget:mount');
  }, []);

  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <AppStatusProvider>
                <WixUserProvider>
                  <PublicWidget
                    instanceId={instanceId}
                    embeddedInWidget={embeddedInWidget}
                  />
                </WixUserProvider>
              </AppStatusProvider>
            </BrowserRouter>
          </Provider>
        </ToastProvider>
      </PolarisAppProvider>
    </React.StrictMode>
  );
}

// ─── PUBLIC WIDGET CUSTOM ELEMENT ──────────────────────────────────────────
// This is the ONLY entry point for the public Wix widget.
// tag name: "consultant-widget"
// Used by: Wix Site Widget (public storefront)
class ConsultantWidget extends HTMLElement {
  static get observedAttributes() {
    return ["instance"];
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    console.log("[🌐 PUBLIC WIDGET] Connected to DOM");

    const instanceId = this.getAttribute("instance") || "";

    if (!instanceId) {
      console.warn(
        "[🌐 PUBLIC WIDGET] connected without 'instance' — " +
        "will re-render when attributeChangedCallback fires."
      );
    }

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    // Setup height observer for Wix Custom Element communication
    this._setupHeightObserver();

    this._doRender(instanceId);
  }

  /**
   * Monitor for height changes from React and notify Wix
   */
  _setupHeightObserver() {
    // Listen for custom events from wixBridge
    this.addEventListener('wix-widget-update', (event) => {
      const { type, height } = event.detail;

      if (type === 'IFRAME_HEIGHT' && height) {
        // Wix page should listen for this event and resize the custom element
        // Dispatch a native event that Wix can listen for
        window.dispatchEvent(new CustomEvent('wix:widget:height-changed', {
          detail: { height, selector: 'consultant-widget' }
        }));

        console.log('[🌐 PUBLIC WIDGET] Height update event dispatched:', height);
      }
    });

    // Observe mutations to detect height attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-iframe_height') {
          const heightStr = this.getAttribute('data-iframe_height');
          if (heightStr) {
            try {
              const { height } = JSON.parse(heightStr);
              if (height) {
                this.style.minHeight = height + 'px';
                console.log('[🌐 PUBLIC WIDGET] Applied height from data attribute:', height);
              }
            } catch (e) {
              console.error('[🌐 PUBLIC WIDGET] Failed to parse height:', e);
            }
          }
        }
      });
    });

    observer.observe(this, {
      attributes: true,
      attributeFilter: ['data-iframe_height']
    });
  }

  // Fires whenever the "instance" attribute is set/changed by Wix
  attributeChangedCallback(name, oldVal, newVal) {
    if (name !== "instance" || newVal === oldVal) return;

    console.info(
      "[🌐 PUBLIC WIDGET] instance updated →",
      newVal ? newVal.slice(0, 20) + "…" : "(empty)"
    );

    if (this._reactRoot) {
      this._doRender(newVal || "");
    }
  }

  disconnectedCallback() {
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = null;
    }
    this._mounted = false;
    console.log("[🌐 PUBLIC WIDGET] Disconnected from DOM");
  }

  _doRender(instanceId) {
    this._reactRoot.render(
      <RootApp instanceId={instanceId} embeddedInWidget />
    );
  }
}

// Register only once — safe across hot-reloads
if (!customElements.get("consultant-widget")) {
  customElements.define("consultant-widget", ConsultantWidget);
  console.log("[🌐 PUBLIC WIDGET] Custom element registered: <consultant-widget>");
}

// ─── Service Worker (Firebase Cloud Messaging) ───────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((reg) => console.log("[🌐 PUBLIC WIDGET - SW] registered:", reg.scope))
      .catch((err) => console.error("[🌐 PUBLIC WIDGET - SW] failed:", err));
  });
}

// ─── Dev only: suppress CRA error overlay in sandboxed iframes ───────────────
if (process.env.NODE_ENV === "development") {
  new MutationObserver(() => {
    ["#react-error-overlay", 'iframe[id*="webpack-dev-server"]'].forEach(
      (sel) => {
        const el = document.querySelector(sel);
        if (el) el.remove();
      }
    );
  }).observe(document.body, { childList: true, subtree: true });
}
