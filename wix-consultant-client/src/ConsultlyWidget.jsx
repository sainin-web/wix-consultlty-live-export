/**
 * CONSULTLY WIDGET - LIGHTWEIGHT VERSION
 *
 * Routes:
 * - /home → Consultant cards
 * - /profile → User profile or login required
 * - /login → Consultant login
 * - /consultant-dashboard → Full-screen dashboard
 *
 * NO heavy instance resolution = FAST!
 * Includes Wix integration for proper context
 */

import React, { Fragment, Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GlobalMessageNotification from "./components/AlertModel/GlobalMessageNotification";
import IncommingCallAlert from "./components/AlertModel/IncommingCallAlert";
import LoginForm from "./components/ConsultantDashboard/LoginForm";
import ProfileSection from "./components/ClientDashbord/ProfileSection";
import TabNavigation from "./components/ConsultantDashboard/TabNavigation";
import StorefrontShell from "./components/ProtectRoute/StorefrontShell";
import ErrorPage from "./pages/ErrorPage";
import ConsultlyHeader from "./components/WidgetHeader/ConsultlyHeader";
import { wixBridge } from "./integrations/wix/wixBridge";
import { widgetModeManager } from "./integrations/wix/wixWidgetModes";
import wixResizer, { useWixResize } from "./integrations/wix/wixResize";

// ── Lazy load components for smaller bundle ──
const ConsultantListing = lazy(() => import("./components/ConsultantCards/ConsultantListing"));
const ViewProfile = lazy(() => import("./components/ConsultantCards/ViewProfile"));
const DashboardPage = lazy(() => import("./apps/consultant/pages/ConsultantDashboardPage"));
const ChatsPage = lazy(() => import("./apps/consultant/pages/ConsultantCallsPage"));
const CallLogsConsultant = lazy(() => import("./apps/consultant/pages/ConsultantCallsPage"));
const ConsultantWalletLogs = lazy(() => import("./apps/consultant/pages/ConsultantEarningsPage"));
const WithdrawalRequestForm = lazy(() => import("./apps/consultant/pages/ConsultantCallsPage"));
const WithdrawalRequestTable = lazy(() => import("./apps/consultant/pages/ConsultantCallsPage"));

function ConsultlyWidget() {
  const location = useLocation();

  // Don't show header on dashboard
  const showHeader = !location.pathname.startsWith("/consultant-dashboard");

  // ── Wix Integration ──
  useEffect(() => {
    // Initialize Wix bridge for consultly widget
    wixBridge.notifyReady();
    wixResizer.markAsWixEmbed();
    wixResizer.start();

    console.log('[CONSULTLY] Wix integration initialized - Dynamic resizer active');
  }, []);

  // ── Widget Mode Management ──
  useEffect(() => {
    const isConsultantLoggedIn = localStorage.getItem('consultant_logged_in') === 'true';
    const isDashboard = location.pathname.startsWith('/consultant-dashboard');

    if (isConsultantLoggedIn && isDashboard) {
      widgetModeManager.setMode('dashboard');
      wixBridge.requestDashboardMode();
    } else {
      widgetModeManager.setMode('storefront');
      if (isConsultantLoggedIn) {
        wixBridge.exitDashboardMode();
      }
    }
  }, [location.pathname]);

  // ── Wix Resize Hook ──
  useWixResize(location);

  return (
    <Fragment>
      <GlobalMessageNotification />
      <IncommingCallAlert />

      {/* ── CONSULTLY HEADER (3 menu items) ── */}
      {showHeader && <ConsultlyHeader />}

      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        <Routes>
          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* ── HOME: Consultant Cards ── */}
          <Route
            path="/home"
            element={
              // <StorefrontShell>
                <ConsultantListing />
              // </StorefrontShell>
            }
          />

          {/* ── PROFILE: User Profile or Login Required ── */}
          <Route
            path="/profile"
            element={
              // <StorefrontShell>
                <ProfileSection />
              // </StorefrontShell>
            }
          >
            <Route index element={<div>Voucher</div>} />
          </Route>

          {/* ── VIEW PROFILE: Consultant Details ── */}
          <Route
            path="/view-profile/:shop_id/:consultant_id"
            element={
              <StorefrontShell>
                <ViewProfile />
              </StorefrontShell>
            }
          />

          {/* ── LOGIN: Consultant Login ── */}
          <Route path="/login" element={<LoginForm />} />

          {/* ── CONSULTANT DASHBOARD: Full Screen (NO HEADER) ── */}
          <Route path="/consultant-dashboard" element={<TabNavigation />}>
            <Route index element={<DashboardPage />} />
            <Route path="chats/:chatId?" element={<ChatsPage />} />
            <Route path="call-chat-logs" element={<CallLogsConsultant />} />
            <Route
              path="consultant-wallet-logs"
              element={<ConsultantWalletLogs />}
            />
            <Route
              path="withdrawal-request"
              element={<WithdrawalRequestForm />}
            />
            <Route
              path="withdrawal-request-table"
              element={<WithdrawalRequestTable />}
            />
          </Route>

          {/* ── ERROR: Fallback ── */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}

export default ConsultlyWidget;
