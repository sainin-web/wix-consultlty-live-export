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
import { useDispatch } from "react-redux";
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
import { checkWixInstance, setInstance } from "./components/Redux/slices/wixAuthSlice";

// ── Lazy load components for smaller bundle ──
const ConsultantListing = lazy(() => import("./components/ConsultantCards/ConsultantListing"));
const ViewProfile = lazy(() => import("./components/ConsultantCards/ViewProfile"));

// Dashboard Pages - NEW
const DashboardPage = lazy(() => import("./apps/consultant/pages/ConsultantDashboardPage"));
const ProfilePage = lazy(() => import("./apps/consultant/pages/ConsultantProfilePage"));
const AvailabilityPage = lazy(() => import("./apps/consultant/pages/ConsultantAvailabilityPage"));
const EarningsPage = lazy(() => import("./apps/consultant/pages/ConsultantEarningsPage"));
const CallsPage = lazy(() => import("./apps/consultant/pages/ConsultantCallsPage"));
const SettingsPage = lazy(() => import("./apps/consultant/pages/ConsultantSettingsPage"));

// Dashboard Pages - OLD (Existing functionality)
const ChatsPage = lazy(() => import("./components/ConsultantDashboard/ChatsPage"));
const CallLogsConsultant = lazy(() => import("./components/ConsultantDashboard/CallChatLogsConsultant"));
const ConsultantWalletLogs = lazy(() => import("./components/ConsultantDashboard/ConsultantWalletLogs"));
const WithdrawalRequestForm = lazy(() => import("./components/ConsultantDashboard/WithdrawalRequestForm"));
const WithdrawalRequestTable = lazy(() => import("./components/ConsultantDashboard/WithdrawalRequestTable"));

function ConsultlyWidget({ wixClient }) {
  const location = useLocation();
  const dispatch = useDispatch();

  // Don't show header on dashboard
  const showHeader = !location.pathname.startsWith("/consultant-dashboard");

  // ── Initialize Wix Client ──
  useEffect(() => {
    console.log("[CONSULTLY-WIDGET] Wix Client ready");

    if (!wixClient) {
      console.warn("[CONSULTLY-WIDGET] No Wix Client provided");
      return;
    }

    // Wix Client is ready to make authenticated requests
    // Consultant cards will fetch data using wixClient.fetchWithAuth()
    console.log("[CONSULTLY-WIDGET] Ready to serve consultant listings");
  }, [wixClient]);

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
            {/* NEW Dashboard Sections */}
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* OLD Dashboard Sections (Existing Functionality) */}
            <Route path="chats/:chatId?" element={<ChatsPage />} />
            <Route path="call-chat-logs" element={<CallLogsConsultant />} />
            <Route path="consultant-wallet-logs" element={<ConsultantWalletLogs />} />
            <Route path="withdrawal-request" element={<WithdrawalRequestForm />} />
            <Route path="withdrawal-request-table" element={<WithdrawalRequestTable />} />
          </Route>

          {/* ── ERROR: Fallback ── */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}

export default ConsultlyWidget;
