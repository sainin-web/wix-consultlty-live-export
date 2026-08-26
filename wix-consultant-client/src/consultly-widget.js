/**
 * CONSULTLY WIDGET ENTRY POINT - LIGHTWEIGHT & FAST
 *
 * This is a FAST alternative to the "our-consultant" menu.
 * No heavy instance resolution = instant mounting.
 *
 * Registers: <consultly-widget> custom element
 * Used by: New "consultly" menu in Wix
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
import { WixInstanceProvider } from "./useContext/WixInstanceContext";

function ConsultlyRoot() {
  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <WixInstanceProvider>
                <WixUserProvider>
                  <ConsultlyWidget />
                </WixUserProvider>
              </WixInstanceProvider>
            </BrowserRouter>
          </Provider>
        </ToastProvider>
      </PolarisAppProvider>
    </React.StrictMode>
  );
}

// ─── CONSULTLY CUSTOM ELEMENT (LIGHTWEIGHT) ────────────────────────────────
class ConsultlyWidgetElement extends HTMLElement {
  static get observedAttributes() {
    return ["instance"];
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;

    console.log("✅ [CONSULTLY] Custom element mounted");

    // Try to get instance from attribute first (Wix provides this)
    const instanceId = this.getAttribute("instance") || localStorage.getItem("wix_instance");
    if (instanceId) {
      console.log("[CONSULTLY] Instance available from attribute/storage:", instanceId.slice(0, 20) + "...");
      localStorage.setItem("wix_instance", instanceId);
    } else {
      console.warn("[CONSULTLY] No instance attribute from Wix - will request via postMessage");
    }

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    this._reactRoot.render(<ConsultlyRoot />);

    // Listen for Wix postMessage with instance (in case it arrives after mount)
    this._setupWixMessageListener();

    // Request instance from parent Wix page
    this._requestInstanceFromWix();

    // Send height to parent Wix after mount
    this._sendHeightToWix();
  }

  /**
   * Request Wix instance from parent page
   * After widget is ready, ask Wix to send the instance
   */
  _requestInstanceFromWix() {
    const attemptRequest = (attempt = 0) => {
      const maxAttempts = 3;
      const delay = 100 + (attempt * 200);

      setTimeout(() => {
        const currentInstance = localStorage.getItem("wix_instance");
        if (currentInstance) {
          console.log("[CONSULTLY] Instance found in localStorage on attempt " + (attempt + 1));
          return;
        }

        if (attempt < maxAttempts) {
          console.log("[CONSULTLY] Requesting instance from Wix parent (attempt " + (attempt + 1) + "/" + maxAttempts + ")...");
          if (window.self !== window.top && window.parent) {
            try {
              window.parent.postMessage(
                {
                  type: "CONSULTLY_WIDGET_READY",
                  action: "REQUEST_INSTANCE",
                  attempt: attempt + 1
                },
                "*"
              );
            } catch (e) {
              console.log("[CONSULTLY] Error requesting instance:", e.message);
            }
          }

          // Try again after delay
          attemptRequest(attempt + 1);
        } else {
          console.warn("[CONSULTLY] ⚠️  Could not obtain Wix instance after " + maxAttempts + " attempts");
          console.warn("[CONSULTLY] Widget is in standalone/fallback mode");
        }
      }, delay);
    };

    attemptRequest();
  }

  /**
   * Handle Wix context delivered via postMessage
   */
  _setupWixMessageListener() {
    const handleMessage = (event) => {
      const data = event.data;

      if (!data || typeof data !== "object") return;

      // Check for instance in various postMessage formats
      const instance = data.instance || data.wixInstance || data.payload?.instance;

      if (instance && typeof instance === "string") {
        console.log("[CONSULTLY-ELEMENT] Instance received from Wix postMessage:", instance.slice(0, 20) + "...");
        localStorage.setItem("wix_instance", instance);
        // Trigger storage event so React context picks up the change
        window.dispatchEvent(new StorageEvent("storage", {
          key: "wix_instance",
          newValue: instance,
          url: window.location.href
        }));
      }

      // Also handle shop_id if provided
      const shopId = data.shopId || data.shop_id || data.wix_id;
      if (shopId && typeof shopId === "string") {
        console.log("[CONSULTLY-ELEMENT] Shop ID received from postMessage:", shopId);
        localStorage.setItem("wix_id", shopId);
        window.dispatchEvent(new StorageEvent("storage", {
          key: "wix_id",
          newValue: shopId,
          url: window.location.href
        }));
      }
    };

    window.addEventListener("message", handleMessage);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "instance" && newVal && newVal !== oldVal) {
      console.log("[CONSULTLY-ELEMENT] Instance attribute changed:", newVal.slice(0, 20) + "...");
      localStorage.setItem("wix_instance", newVal);
      // Trigger storage event so React context picks up the change
      window.dispatchEvent(new StorageEvent("storage", {
        key: "wix_instance",
        newValue: newVal,
        url: window.location.href
      }));
    }
  }

  _sendHeightToWix() {
    setTimeout(() => {
      const height = this.scrollHeight || 800;
      if (window.self !== window.top && window.parent) {
        try {
          window.parent.postMessage(
            {
              type: "widget-height-update",
              height: height,
            },
            "*"
          );
        } catch (e) {
          console.log("Height update: not in Wix iframe");
        }
      }
    }, 100);
  }

  disconnectedCallback() {
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = null;
    }
    this._mounted = false;
  }
}

customElements.define("consultly-widget", ConsultlyWidgetElement);
console.log("✅ <consultly-widget> registered");
