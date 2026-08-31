import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkUserBalance, openCallPage } from "../middle-ware/OpenCallingPage";
import { getCustomerId } from "../../utils/wixStorage";
import { useWixUser } from "../../useContext/WixUserContext";
import { useWixAuth } from "../../useContext/WixAuthContext";
import { ConsultantGrid } from "./ConsultantGrid";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { perfMark, perfMeasure } from "../../utils/performanceMonitor";
import "./ConsultantListing.css";

/**
 * Professional consultant marketplace listing.
 * Handles data fetching, caching, and state management.
 *
 * AUTHENTICATION:
 * - Uses Wix Client from WixAuthContext
 * - wixClient.fetchWithAuth() includes Wix access token automatically
 * - Backend receives Authorization header with Wix token
 * - Backend verifies token using Wix APIs
 * - Backend resolves shop from verified token
 *
 * STATES:
 * - Loading: Wix Client initializing or fetching from API
 * - Ready: Wix Client ready, consultants available
 * - Error: Failed to fetch or API error
 * - Empty: No consultants found
 */
function ConsultantListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useWixUser();
  const userId = user?.wixDbId || getCustomerId();
  const wixClient = useWixAuth();

  const { consultants, loading, error } = useSelector(
    (state) => state.consultants
  );
  const { voucherData } = useSelector((state) => state.users);

  const [loginPrompt, setLoginPrompt] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Mark storefront component mount
  useEffect(() => {
    perfMark('storefront:mount');
  }, []);

  // Wait for Wix Client to be ready
  useEffect(() => {
    const { wixClient: client, isReady, error } = wixClient;

    console.log("[STOREFRONT] Checking Wix Client...");

    if (error) {
      console.error("[STOREFRONT] ✗ Wix Auth error:", error);
      return;
    }

    if (!isReady) {
      console.log("[STOREFRONT] Wix Client initializing...");
      return;
    }

    if (!client) {
      console.warn("[STOREFRONT] ✗ Wix Client not available");
      return;
    }

    console.log("[STOREFRONT] ✓ Wix Client ready");
    setAuthReady(true);
  }, [wixClient]);

  // Load consultants once Wix Client is ready
  useEffect(() => {
    if (!authReady || hasAttemptedFetch) {
      return;
    }

    if (!consultants?.findConsultant || consultants.findConsultant.length === 0) {
      console.log("[STOREFRONT] Fetching consultants with authenticated Wix request");

      setHasAttemptedFetch(true);
      perfMark('storefront:fetch-start');

      // Extract wixClient from context
      const { wixClient: client } = wixClient;
      if (!client) {
        console.error("[STOREFRONT] ✗ wixClient not available");
        dispatch({
          type: "consultants/setError",
          payload: "Wix Client not available",
        });
        return;
      }

      // Use Wix Client's fetchWithAuth to make authenticated request
      // This automatically includes Wix access token in Authorization header
      const backendUrl = process.env.REACT_APP_BACKEND_HOST || "http://localhost:3500";
      const url = `${backendUrl}/api/consultant/wix-store-front?page=1&limit=12`;

      client
        .fetchWithAuth(url, {
          method: "GET",
        })
        .then((response) => {
          console.log("[BACKEND] Response received from /api/consultant/wix-store-front");

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("[STOREFRONT] ✓ Consultants returned:", data.findConsultant?.length || 0);

          // Dispatch to Redux to store the data
          dispatch({
            type: "consultants/setConsultants",
            payload: data,
          });

          perfMark('storefront:fetch-end');
          perfMeasure('storefront:fetch-start', 'storefront:fetch-end');
        })
        .catch((error) => {
          console.error("[STOREFRONT] ✗ Failed to fetch consultants:", error.message);

          dispatch({
            type: "consultants/setError",
            payload: error.message,
          });
        });
    } else {
      console.log("[STOREFRONT] Using cached consultants:", consultants.findConsultant.length);
    }
  }, [authReady, hasAttemptedFetch, dispatch, consultants, wixClient]);

  // Map consultants with proper data handling
  const mappedConsultants = React.useMemo(() => {
    if (!Array.isArray(consultants?.findConsultant)) {
      return [];
    }

    return consultants.findConsultant.map((consultant) => {
      // Parse languages safely
      let languages = [];
      try {
        if (typeof consultant.language === "string") {
          languages = JSON.parse(consultant.language);
        } else if (Array.isArray(consultant.language)) {
          if (
            consultant.language.length > 0 &&
            typeof consultant.language[0] === "string"
          ) {
            languages = JSON.parse(consultant.language[0]);
          } else {
            languages = consultant.language;
          }
        }
        if (!Array.isArray(languages)) {
          languages = [languages].filter(Boolean);
        }
      } catch {
        languages = consultant.language ? [consultant.language] : [];
      }

      // Build consultant object with only real data
      return {
        id: consultant._id || consultant.id,
        name: consultant.displayName || consultant.fullname || "Consultant",
        image: consultant.profileImage
          ? consultant.profileImage.replace(/^http:\/\//i, "https://")
          : "",
        profession: consultant.profession || "",
        specialization: consultant.specialization || "",
        experience: parseInt(consultant.experience) || 0,
        shop_id: consultant.shop_id,
        languages,
        isActive: consultant.isActive || false,
        isBusy: consultant?.isBusy || false,
        // Pricing data
        chatPrice: voucherData
          ? `${voucherData.shopCurrency || "₹"}${parseInt(consultant?.chatPerMinute) || 0}`
          : null,
        audioPrice: voucherData
          ? `${voucherData.shopCurrency || "₹"}${parseInt(consultant?.voicePerMinute) || 0}`
          : null,
        videoPrice: voucherData
          ? `${voucherData.shopCurrency || "₹"}${parseInt(consultant?.videoPerMinute) || 0}`
          : null,
      };
    });
  }, [consultants, voucherData]);

  // Handle view profile navigation
  const handleViewProfile = (shop_id, consultant_id) => {
    navigate(`/view-profile/${shop_id}/${consultant_id}`);
  };

  // Handle chat navigation with login check
  const handleChat = async (consultantId) => {
    if (!userId) {
      setLoginPrompt(true);
      return;
    }

    const shopId = localStorage.getItem("wix_id");
    const balance = await checkUserBalance({
      userId,
      consultantId,
      type: "chat",
      shop: shopId,
    });

    if (balance?.requiresLogin) {
      setLoginPrompt(true);
      return;
    }

    navigate(`/chats/${consultantId}`);
  };

  // Handle call with login check
  const handleCall = async ({ receiverId, type }) => {
    if (!userId) {
      setLoginPrompt(true);
      return;
    }

    const shopId = localStorage.getItem("wix_id");
    await openCallPage({
      receiverId,
      type,
      userId,
      shop: shopId,
      storeUrl: shopId,
    });
  };

  // Render login prompt modal
  if (loginPrompt) {
    return (
      <>
        <div className="consultant-login-prompt-overlay">
          <div className="consultant-login-prompt-dialog">
            <div className="consultant-login-prompt-icon">🔒</div>
            <h2>Login Required</h2>
            <p>
              You cannot access this feature without logging in. Please login
              first.
            </p>
            <div className="consultant-login-prompt-actions">
              <button
                className="consultant-login-prompt-button consultant-login-prompt-primary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="consultant-login-prompt-button consultant-login-prompt-secondary"
                onClick={() => setLoginPrompt(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <ConsultantListingContent
          loading={loading}
          error={error}
          mappedConsultants={mappedConsultants}
          onViewProfile={handleViewProfile}
          onChat={handleChat}
          onCall={handleCall}
          isAuthenticated={authReady}
        />
      </>
    );
  }

  return (
    <ConsultantListingContent
      loading={loading}
      error={error}
      mappedConsultants={mappedConsultants}
      onViewProfile={handleViewProfile}
      onChat={handleChat}
      onCall={handleCall}
      isAuthenticated={authReady}
    />
  );
}

/**
 * Consultant listing content wrapper with state handling.
 */
function ConsultantListingContent({
  loading,
  error,
  mappedConsultants,
  onViewProfile,
  onChat,
  onCall,
  isAuthenticated,
}) {
  return (
    <main className="consultant-listing-main">
      <section className="consultant-listing-container">
        {/* Hero Section */}
        <div className="consultant-listing-hero">
          <h1>Find the Right Consultant</h1>
          <p>Connect with experienced professionals ready to help</p>
        </div>

        {/* Content Section - Show appropriate state */}
        {!isAuthenticated && <LoadingState />}
        {isAuthenticated && error && <ErrorState />}
        {isAuthenticated && !error && (
          <>
            {loading ? (
              <LoadingState />
            ) : mappedConsultants.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="consultant-listing-section-header">
                  <h2>Available Consultants</h2>
                  <p className="consultant-listing-count">
                    {mappedConsultants.length}{" "}
                    {mappedConsultants.length === 1 ? "consultant" : "consultants"}
                  </p>
                </div>
                <ConsultantGrid
                  consultants={mappedConsultants}
                  onViewProfile={onViewProfile}
                  onChat={onChat}
                  onCall={onCall}
                  loading={loading}
                />
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default ConsultantListing;
