/**
 * WIX ADMIN DASHBOARD APPLICATION
 *
 * This file contains ONLY the admin dashboard.
 * It is used by the Wix Dashboard Page extension.
 *
 * Routes:
 * - /admin - Dashboard home
 * - /admin/consultant-list - Consultant management
 * - /admin/consultant-list/add-consultant - Add/edit consultant
 * - /admin/wallet-management - Wallet management
 * - /admin/withdrawal-request - Withdrawal requests
 * - /admin/account-information - Admin account
 * - /admin/voucher-management - Voucher management
 * - /admin/admin-percentage - Admin percentage settings
 * - /admin/revenue-management - Revenue management
 * - /admin/faq - FAQ
 * - /admin/history - Transaction history
 *
 * This does NOT include public widget routes or public UI.
 */

import { Fragment, useEffect, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  checkWixInstance,
  setInstance,
} from "./components/Redux/slices/wixAuthSlice";
import "./App.css";
import "./css/saas-theme.css";

import GlobalMessageNotification from "./components/AlertModel/GlobalMessageNotification";
import WixProtectedRoute from "./components/ProtectRoute/WixProtectedRoute";
import ErrorPage from "./pages/ErrorPage";

// ── Lazy load ADMIN pages only ─────────────────────────────────────────────
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ConsultantList = lazy(() => import("./pages/ConsultantList"));
const AddConsultant = lazy(() => import("./pages/AddConsultant"));
const Faq = lazy(() => import("./pages/Faq"));
const LayoutBigCommerce = lazy(() => import("./pages/LayoutBigCommerce"));
const UserTransHistory = lazy(() => import("./pages/UserTransHistory"));
const ManualDebetCreditBlance = lazy(
  () => import("./pages/ManualDebetCreditBlance"),
);
const WithdrawalRequest = lazy(() => import("./pages/WithdrawalRequest"));
const AccountInformation = lazy(() => import("./pages/AccountInformation"));
const VoucherTable = lazy(() => import("./pages/VoucherTable"));
const VoucherSettings = lazy(() => import("./pages/VoucherSettings"));
const AdminPercentage = lazy(() => import("./pages/AdminPercentage"));
const RevenuManagement = lazy(() => import("./pages/RevenuManagement"));

export default function AdminDashboard({
  instanceId: instanceFromWidget = "",
}) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  console.log("[🔐 ADMIN DASHBOARD] Initialized - Admin only, NO public widget");

  useEffect(() => {
    const resolveInstance = () => {
      const fromUrl = new URLSearchParams(window.location.search).get(
        "instance",
      );
      return (
        fromUrl ||
        instanceFromWidget ||
        localStorage.getItem("wix_id") ||
        null
      );
    };

    const runCheck = (instance) => {
      if (!instance) {
        console.error("[🔐 ADMIN DASHBOARD] No instance provided");
        dispatch(checkWixInstance(null));
        return;
      }
      console.log("[🔐 ADMIN DASHBOARD] Instance found:", instance);
      localStorage.setItem("wix_id", instance);
      dispatch(setInstance(instance));
      dispatch(checkWixInstance(instance));
    };

    const immediate = resolveInstance();
    if (immediate) {
      runCheck(immediate);
      return;
    }

    const timer = setTimeout(() => runCheck(resolveInstance()), 2500);
    return () => clearTimeout(timer);
  }, [dispatch, instanceFromWidget]);

  useEffect(() => {
    const onParentMessage = (event) => {
      const data = event.data;
      const inst =
        (typeof data === "object" && data !== null
          ? data.instance || data.payload?.instance
          : null) || null;

      if (!inst || typeof inst !== "string" || inst.length < 8) return;
      if (localStorage.getItem("wix_id") === inst) return;

      console.log("[🔐 ADMIN DASHBOARD] Instance from parent message:", inst);
      localStorage.setItem("wix_id", inst);
      dispatch(setInstance(inst));
      dispatch(checkWixInstance(inst));
    };

    window.addEventListener("message", onParentMessage);
    return () => window.removeEventListener("message", onParentMessage);
  }, [dispatch]);

  const instance = searchParams.get("instance");
  const q = instance ? `?instance=${instance}` : "";

  return (
    <Fragment>
      <GlobalMessageNotification />

      <Suspense fallback={<div className="loading-screen">Loading Admin Dashboard...</div>}>
        <Routes>
          {/* ── Utility ── */}
          <Route path="/error" element={<ErrorPage />} />

          {/* ── Root redirect to admin ── */}
          <Route path="/" element={<Navigate to={`/admin${q}`} replace />} />

          {/* ── ADMIN ONLY — Wix protected ── */}
          <Route
            path="/admin"
            element={
              <WixProtectedRoute>
                <LayoutBigCommerce />
              </WixProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="consultant-list" element={<ConsultantList />} />
            <Route
              path="consultant-list/add-consultant"
              element={<AddConsultant />}
            />
            <Route path="history" element={<UserTransHistory />} />
            <Route
              path="wallet-management"
              element={<ManualDebetCreditBlance />}
            />
            <Route path="withdrawal-request" element={<WithdrawalRequest />} />
            <Route
              path="account-information"
              element={<AccountInformation />}
            />
            <Route path="voucher-management" element={<VoucherTable />} />
            <Route
              path="voucher-management/voucher"
              element={<VoucherSettings />}
            />
            <Route path="admin-percentage" element={<AdminPercentage />} />
            <Route path="revenue-management" element={<RevenuManagement />} />
            <Route path="faq" element={<Faq />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/error" replace />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}
