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
 */

import React, { Fragment, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GlobalMessageNotification from "./components/AlertModel/GlobalMessageNotification";
import IncommingCallAlert from "./components/AlertModel/IncommingCallAlert";
import LoginForm from "./components/ConsultantDashboard/LoginForm";
import ProfileSection from "./components/ClientDashbord/ProfileSection";
import TabNavigation from "./components/ConsultantDashboard/TabNavigation";
import StorefrontShell from "./components/ProtectRoute/StorefrontShell";
import ErrorPage from "./pages/ErrorPage";
import ConsultlyHeader from "./components/WidgetHeader/ConsultlyHeader";

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
              <StorefrontShell>
                <ConsultantListing />
              </StorefrontShell>
            }
          />

          {/* ── PROFILE: User Profile or Login Required ── */}
          <Route
            path="/profile"
            element={
              <StorefrontShell>
                <ProfileSection />
              </StorefrontShell>
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
