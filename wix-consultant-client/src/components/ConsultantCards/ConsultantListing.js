import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsultants } from "../Redux/slices/ConsultantSlices";
import { checkUserBalance, openCallPage } from "../middle-ware/OpenCallingPage";
import { getCustomerId } from "../../utils/wixStorage";
import { useWixUser } from "../../useContext/WixUserContext";
import { ConsultantGrid } from "./ConsultantGrid";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { perfMark, perfMeasure } from "../../utils/performanceMonitor";
import { waitForWixAccessToken } from "../../services/wixAuth";
import "./ConsultantListing.css";

/**
 * Professional consultant marketplace listing.
 * Handles data fetching, caching, and state management.
 *
 * PERF OPTIMIZATION:
 * - Renders skeleton immediately (does not wait for API)
 * - Socket is NOT initialized for storefront (only for chat/calls)
 * - Uses Redux cache to prevent duplicate API calls
 *
 * WIX AUTHENTICATION:
 * - Obtains Wix access token from environment
 * - Passes token to backend for verification
 * - Backend resolves shop ID from token
 */
function ConsultantListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useWixUser();
  const userId = user?.wixDbId || getCustomerId();

  const { consultants, loading, error } = useSelector(
    (state) => state.consultants
  );
  const { voucherData } = useSelector((state) => state.users);

  const [loginPrompt, setLoginPrompt] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [isWaitingForToken, setIsWaitingForToken] = useState(true);

  // Mark storefront component mount
  useEffect(() => {
    perfMark('storefront:mount');
  }, []);

  // Obtain Wix access token
  useEffect(() => {
    let mounted = true;

    const obtainToken = async () => {
      try {
        console.log("[STOREFRONT] Obtaining Wix access token...");
        const token = await waitForWixAccessToken(10, 500);

        if (mounted) {
          if (token) {
            console.log("[STOREFRONT] Access token obtained successfully");
            setAccessToken(token);
          } else {
            console.warn("[STOREFRONT] Failed to obtain access token after retries");
          }
          setIsWaitingForToken(false);
        }
      } catch (err) {
        console.error("[STOREFRONT] Error obtaining access token:", err);
        if (mounted) {
          setIsWaitingForToken(false);
        }
      }
    };

    obtainToken();

    return () => {
      mounted = false;
    };
  }, []);

  // Load consultants and vouchers in parallel
  // Once access token is available, fetch consultants
  useEffect(() => {
    console.log("[STOREFRONT-DEBUG] Effect running - token ready:", !!accessToken, "waiting:", isWaitingForToken);

    // Wait for token to be obtained
    if (isWaitingForToken) {
      console.log("[STOREFRONT-DEBUG] Still waiting for access token...");
      return;
    }

    if (!accessToken) {
      console.warn("[STOREFRONT-DEBUG] Access token not available after waiting");
      return;
    }

    // Only fetch once
    if (hasAttemptedFetch) {
      console.log("[STOREFRONT-DEBUG] Already attempted fetch, skipping");
      return;
    }

    setHasAttemptedFetch(true);
    perfMark('storefront:fetch-start');

    // Only fetch if data is not already in Redux
    const dispatchActions = [];

    console.log("[STOREFRONT-DEBUG] Current Redux consultants state:", {
      hasData: !!consultants?.findConsultant,
      count: consultants?.findConsultant?.length || 0,
    });

    if (!consultants?.findConsultant || consultants.findConsultant.length === 0) {
      console.log("[STOREFRONT] Fetching consultants with access token");
      console.log("[STOREFRONT-DEBUG] Calling fetchConsultants with:", { accessToken: accessToken.slice(0, 20) + "...", page: 1, limit: 12 });
      dispatchActions.push(
        dispatch(fetchConsultants({ accessToken, page: 1, limit: 12 }))
      );
    } else {
      console.log("[STOREFRONT] Using cached consultants:", consultants.findConsultant.length);
    }

    // Fetch voucher data if needed (this doesn't require token)
    if (!voucherData) {
      console.log("[STOREFRONT] Fetching voucher data");
      // NOTE: fetchVoucherData currently requires shopId - we'll get that from backend response
      // For now, skip this to avoid errors - it will be fetched when consultants are available
    } else {
      console.log("[STOREFRONT] Using cached voucher data");
    }

    // Only use Promise.all if we have actions to dispatch
    if (dispatchActions.length > 0) {
      Promise.all(dispatchActions).then(() => {
        perfMark('storefront:fetch-end');
        perfMeasure('storefront:fetch-start', 'storefront:fetch-end');
      });
    }
  }, [isWaitingForToken, accessToken, hasAttemptedFetch, dispatch, consultants, voucherData]);

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
          isWaitingForToken={isWaitingForToken}
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
      isWaitingForToken={isWaitingForToken}
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
  isWaitingForToken,
}) {
  return (
    <main className="consultant-listing-main">
      <section className="consultant-listing-container">
        {/* Hero Section */}
        <div className="consultant-listing-hero">
          <h1>Find the Right Consultant</h1>
          <p>Connect with experienced professionals ready to help</p>
        </div>

        {/* Content Section */}
        {isWaitingForToken ? (
          <LoadingState />
        ) : loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
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
      </section>
    </main>
  );
}

export default ConsultantListing;
