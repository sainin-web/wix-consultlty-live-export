/**
 * ADMIN DASHBOARD ENTRY POINT
 *
 * This file is ONLY for the Wix Admin Dashboard extension.
 * It mounts the AdminDashboard React app.
 *
 * IMPORTANT: This is a COMPLETELY SEPARATE entry point from the public widget.
 * This does NOT register or load the public widget custom element.
 * The public widget has its own entry point (index.js).
 *
 * Do NOT add public widget routes or public UI here.
 */

// FIX 1 — Must be first import: installs in-memory localStorage before
// Agora SDK or any other module touches window.localStorage
import "./localStoragePolyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import AdminDashboard from "./AdminDashboard";
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

console.log("[🔐 ADMIN ENTRY POINT] Loading - Admin dashboard only");

// ─── Shared React tree ───────────────────────────────────────────────────────
function RootAdminApp({ instanceId }) {
  React.useEffect(() => {
    perfMark('admin-dashboard:mount');
  }, []);

  return (
    <React.StrictMode>
      <PolarisAppProvider i18n={en}>
        <ToastProvider>
          <Provider store={store}>
            <BrowserRouter>
              <AppStatusProvider>
                <WixUserProvider>
                  <AdminDashboard instanceId={instanceId} />
                </WixUserProvider>
              </AppStatusProvider>
            </BrowserRouter>
          </Provider>
        </ToastProvider>
      </PolarisAppProvider>
    </React.StrictMode>
  );
}

// ─── ADMIN DASHBOARD MOUNT (Wix Dashboard Page extension) ────────────────────
const adminContainer =
  document.getElementById("root") ||
  document.getElementById("admin-root");

if (adminContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const instanceId = urlParams.get("instance") || "";

  console.log("[🔐 ADMIN DASHBOARD] Mounting to container with instance:", instanceId?.slice(0, 20) + "...");

  ReactDOM.createRoot(adminContainer).render(
    <RootAdminApp instanceId={instanceId} />
  );
} else {
  console.error("[🔐 ADMIN DASHBOARD] ERROR: No root container found (#root or #admin-root)");
}

// ─── Service Worker (Firebase Cloud Messaging) ───────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((reg) => console.log("[🔐 ADMIN - SW] registered:", reg.scope))
      .catch((err) => console.error("[🔐 ADMIN - SW] failed:", err));
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
