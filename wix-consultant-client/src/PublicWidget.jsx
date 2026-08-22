/**
 * PUBLIC WIX WIDGET APPLICATION
 *
 * This file contains ONLY the public-facing consultant widget.
 * It is registered as a Wix custom element: <consultant-widget>
 *
 * Routes:
 * - /consultant/card - List all consultants
 * - /view-profile/:shop_id/:consultant_id - View consultant profile
 * - /login - Consultant login
 * - /profile - Consultant profile/account area
 * - /consultant-dashboard - Consultant dashboard (full-screen, no Wix frame)
 *
 * This does NOT include admin routes or admin UI.
 */

import { Fragment, useEffect, Suspense, lazy, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyToken } from "./components/Redux/slices/authConsultantSlice";
import {
  checkWixInstance,
  setInstance,
} from "./components/Redux/slices/wixAuthSlice";
import "./App.css";
import "./css/saas-theme.css";

import GlobalMessageNotification from "./components/AlertModel/GlobalMessageNotification";
import IncomingCallAlert from "./components/AlertModel/IncommingCallAlert";
import PushCallIncoming from "./components/AlertModel/PushCallIncoming";
import useAutoResizeIframe from "./components/middle-ware/GlobleResizer";
import ErrorPage from "./pages/ErrorPage";
import TestHash from "./pages/TestHash";
import StorefrontShell from "./components/ProtectRoute/StorefrontShell";
import { persistCustomerId } from "./utils/wixStorage";

// ── Wix Integration ──
import ApplicationHeader from "./components/WidgetHeader/ApplicationHeader";
import { wixBridge } from "./integrations/wix/wixBridge";
import { widgetModeManager } from "./integrations/wix/wixWidgetModes";
import wixResizer, { useWixResize } from "./integrations/wix/wixResize";

// ── Lazy load public pages only ────────────────────────────────────────────
const ConsultantListing = lazy(
  () => import("./components/ConsultantCards/ConsultantListing"),
);
const ViewProfile = lazy(
  () => import("./components/ConsultantCards/ViewProfile"),
);
const VideoCallingWrapper = lazy(
  () => import("./components/Video/VideoCallingWrapper"),
);
const ChatPageWrapper = lazy(
  () => import("./components/Chat/ChatPageWrapper"),
);
const LoginForm = lazy(
  () => import("./components/ConsultantDashboard/LoginForm"),
);
const ProfileSection = lazy(
  () => import("./components/ClientDashbord/ProfileSection"),
);
const Voucher = lazy(() => import("./pages/Voucher"));
const History = lazy(() => import("./pages/History"));
const FcmTokenWindow = lazy(() => import("./firebase/utils/FcmTokenWindow"));
const TabNavigation = lazy(
  () => import("./components/ConsultantDashboard/TabNavigation"),
);
const DashboardPage = lazy(
  () => import("./components/ConsultantDashboard/DashboardPage"),
);
const ChatsPage = lazy(
  () => import("./components/ConsultantDashboard/ChatsPage"),
);
const CallLogsConsultant = lazy(
  () => import("./components/ConsultantDashboard/CallChatLogsConsultant"),
);
const ConsultantWalletLogs = lazy(
  () => import("./components/ConsultantDashboard/ConsultantWalletLogs"),
);
const WithdrawalRequestForm = lazy(
  () => import("./components/ConsultantDashboard/WithdrawalRequestForm"),
);
const WithdrawalRequestTable = lazy(
  () => import("./components/ConsultantDashboard/WithdrawalRequestTable"),
);

export default function PublicWidget({
  instanceId: instanceFromWidget = "",
  embeddedInWidget = false,
}) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState();
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  console.log("[🌐 PUBLIC WIDGET] Initialized - Public app only");

  // ── Wix Integration Initialization ──
  useEffect(() => {
    // Initialize Wix bridge for public widget
    wixBridge.notifyReady();
    setIsWidgetReady(true);

    // Mark as Wix embed and start dynamic resizing
    wixResizer.markAsWixEmbed();
    wixResizer.start();

    console.log('[🌐 PUBLIC WIDGET] Wix integration initialized - Dynamic resizer active');
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

  // ── Wix Resize Hook (handles initialization and route changes) ──
  useWixResize(location);

  useEffect(() => {
    dispatch(verifyToken());

    const resolveInstance = () => {
      const fromUrl = new URLSearchParams(window.location.search).get(
        "instance",
      );
      return (
        fromUrl ||
        instanceFromWidget ||
        localStorage.getItem("wix_instance") ||
        null
      );
    };

    const runCheck = (instance) => {
      if (!instance) {
        dispatch(checkWixInstance(null));
        return;
      }
      localStorage.setItem("wix_instance", instance);
      dispatch(setInstance(instance));
      dispatch(checkWixInstance(instance));
    };

    const immediate = resolveInstance();
    if (immediate) {
      runCheck(immediate);
      return;
    }

    if (embeddedInWidget && !instanceFromWidget) {
      return;
    }

    const timer = setTimeout(() => runCheck(resolveInstance()), 2500);
    return () => clearTimeout(timer);
  }, [dispatch, instanceFromWidget, embeddedInWidget]);

  useEffect(() => {
    const onParentMessage = (event) => {
      const data = event.data;
      const inst =
        (typeof data === "object" && data !== null
          ? data.instance || data.payload?.instance
          : null) || null;

      if (!inst || typeof inst !== "string" || inst.length < 8) return;
      if (localStorage.getItem("wix_instance") === inst) return;

      localStorage.setItem("wix_instance", inst);
      dispatch(setInstance(inst));
      dispatch(checkWixInstance(inst));
    };

    window.addEventListener("message", onParentMessage);
    return () => window.removeEventListener("message", onParentMessage);
  }, [dispatch]);

  useAutoResizeIframe();

  // ── Login/Dashboard redirect guard ──
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("consultant_logged_in");
    const token = localStorage.getItem("token");
    const currentPath = location.pathname;
    const instance =
      new URLSearchParams(window.location.search).get("instance") ||
      localStorage.getItem("wix_instance");
    const q = instance ? `?instance=${instance}` : "";

    // DEBUG
    console.log("[🌐 PUBLIC WIDGET - Auth Guard]", {
      isLoggedIn,
      hasToken: !!token,
      currentPath,
      instance,
    });

    // Already logged in → skip login page
    if (isLoggedIn === "true" && token && currentPath === "/login") {
      console.log("[🌐 PUBLIC WIDGET - Auth Guard] Logged in user on login page → redirect to dashboard");
      navigate(`/consultant-dashboard${q}`, { replace: true });
      return;
    }

    // Not logged in → block dashboard (IMPORTANT: Full-screen, no Wix frame)
    if (
      (!isLoggedIn || !token) &&
      currentPath.startsWith("/consultant-dashboard")
    ) {
      console.log("[🌐 PUBLIC WIDGET - Auth Guard] Not logged in but accessing dashboard → redirect to login");
      navigate(`/login${q}`, { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  const instance = searchParams.get("instance");
  const q = instance ? `?instance=${instance}` : "";

  const [wixUser, setWixUser] = useState();
  useEffect(() => {
    // URL se Wix user data lo (page load pe)
    const params = new URLSearchParams(window.location.search);
    if (params.get("wixLoggedIn") === "true") {
      setWixUser({
        id: params.get("wixMemberId"),
        email: params.get("wixEmail"),
        name: params.get("wixName"),
        photo: params.get("wixPhoto"),
      });
    }

    window.addEventListener("message", (e) => {
      if (e.data?.type === "WIX_USER_LOGGED_IN") {
        console.log("[🌐 PUBLIC WIDGET] Wix user logged in:", e.data.wixEmail);
        setWixUser({
          id: e.data.wixMemberId,
          email: e.data.wixEmail,
          name: e.data.wixName,
          photo: e.data.wixPhoto,
        });
      }
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLoggedIn = params.get("wixLoggedIn");
    const email = params.get("wixEmail");
    const firstName = params.get("wixName");
    const lastName = params.get("wixLastName");
    const memberId = params.get("wixMemberId");
    const photo = params.get("wixPhoto");
    const wixDbId = params.get("wixDbId");

    if (isLoggedIn === "true" && wixDbId) {
      console.log("[🌐 PUBLIC WIDGET] ✅ Logged in user:", email);
      persistCustomerId(wixDbId, {
        email,
        firstName,
        lastName,
        memberId,
        photo,
      });
      setUser({ email, firstName, lastName, memberId, photo, wixDbId });
    } else {
      console.log("[🌐 PUBLIC WIDGET] Guest — login page shown");
    }
  }, []);

  return (
    <Fragment>
      <GlobalMessageNotification />
      <IncomingCallAlert />

      {/* ── Application Header (inside widget) ── */}
      {isWidgetReady && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/consultant-dashboard') && (
        <ApplicationHeader />
      )}

      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        <Routes>
          {/* ── Public / utility ── */}
          <Route path="/TestHash" element={<TestHash />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route
            path="/video/calling/page"
            element={<VideoCallingWrapper />}
          />
          <Route
            path="/chats/:id"
            element={<ChatPageWrapper />}
          />
          <Route path="/fcm-token" element={<FcmTokenWindow />} />
          <Route path="/push-call-incoming" element={<PushCallIncoming />} />

          {/* ── Root redirects ── */}
          <Route path="/" element={<Navigate to={`/consultant/card${q}`} replace />} />

          {/* ── Storefront — WixInstanceGuard protected ── */}
          <Route
            path="/consultant/card"
            element={
              <StorefrontShell>
                <ConsultantListing />
              </StorefrontShell>
            }
          />

          <Route
            path="/view-profile/:shop_id/:consultant_id"
            element={
              <StorefrontShell>
                <ViewProfile />
              </StorefrontShell>
            }
          />

          <Route
            path="/login"
            element={<LoginForm />}
          />

          <Route
            path="/profile"
            element={
              <StorefrontShell>
                <ProfileSection />
              </StorefrontShell>
            }
          >
            <Route index element={<Voucher />} />
            <Route path="voucher" element={<Voucher />} />
            <Route path="history" element={<History />} />
            <Route path="call-chat-logs" element={<CallLogsConsultant />} />
          </Route>

          {/* ── CONSULTANT DASHBOARD — Full Screen (NO WIX HEADER/FOOTER) ── */}
          <Route
            path="/consultant-dashboard"
            element={<TabNavigation />}
          >
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

          <Route path="*" element={<Navigate to="/error" replace />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}
