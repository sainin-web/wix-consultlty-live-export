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

function ConsultlyRoot() {
  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <WixUserProvider>
                <ConsultlyWidget />
              </WixUserProvider>
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

    console.log("✅ [CONSULTLY] Mounted (lightweight, fast!)");

    const instanceId = this.getAttribute("instance") || localStorage.getItem("wix_instance") || "test-instance-dev-build";
    if (instanceId) {
      console.log("[CONSULTLY] Received instance:", instanceId.slice(0, 20) + "...");
      localStorage.setItem("wix_instance", instanceId);
    }

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this);
    }

    this._reactRoot.render(<ConsultlyRoot />);

    // Send height to parent Wix after mount
    this._sendHeightToWix();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "instance" && newVal && newVal !== oldVal) {
      console.log("[CONSULTLY] Instance updated:", newVal.slice(0, 20) + "...");
      localStorage.setItem("wix_instance", newVal);
      if (this._reactRoot) {
        this._reactRoot.render(<ConsultlyRoot />);
      }
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
