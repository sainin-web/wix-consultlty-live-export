import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsultants } from "../Redux/slices/ConsultantSlices";
import { fetchVoucherData } from "../Redux/slices/UserSlices";
import { checkUserBalance, openCallPage } from "../middle-ware/OpenCallingPage";
import { getCustomerId } from "../../utils/wixStorage";
import { useWixUser } from "../../useContext/WixUserContext";
import { useWixInstance } from "../../useContext/WixInstanceContext";
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
 * PERF OPTIMIZATION:
 * - Renders skeleton immediately (does not wait for API)
 * - Socket is NOT initialized for storefront (only for chat/calls)
 * - Uses Redux cache to prevent duplicate API calls
 *
 * WIX INSTANCE HANDLING:
 * - Waits for Wix instance context to be ready
 * - Automatically fetches when instance becomes available
 * - Shows loading state while waiting for Wix context
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

  // Get Wix context (instance and shop_id) - this waits for async Wix delivery
  const wixInstance = useWixInstance();
  const { instance, shopId, isContextReady, isLoading: isContextLoading } = wixInstance;

  const [loginPrompt, setLoginPrompt] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Mark storefront component mount
  useEffect(() => {
    perfMark('storefront:mount');
  }, []);

  // Load consultants and vouchers in parallel
  // Waits for Wix context to be ready, then fetches
  useEffect(() => {
    console.log("[STOREFRONT-DEBUG] Effect running - context ready:", isContextReady, "instance:", instance ? instance.slice(0, 20) + "..." : "missing", "shopId:", shopId);

    // Wait for Wix context to load
    if (isContextLoading) {
      console.log("[STOREFRONT-DEBUG] Still waiting for Wix context...");
      return;
    }

    // Wix context loaded, check if we have required data
    if (!isContextReady || !instance || !shopId) {
      console.warn("[STOREFRONT-DEBUG] Wix context loaded but missing data", { isContextReady, hasInstance: !!instance, hasShopId: !!shopId });
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
      console.log("[STOREFRONT] Fetching consultants for shop:", shopId);
      console.log("[STOREFRONT-DEBUG] Calling fetchConsultants with:", { instance: instance.slice(0, 20) + "...", page: 1, limit: 12 });
      dispatchActions.push(
        dispatch(fetchConsultants({ instance, page: 1, limit: 12 }))
      );
    } else {
      console.log("[STOREFRONT] Using cached consultants:", consultants.findConsultant.length);
    }

    if (!voucherData) {
      console.log("[STOREFRONT] Fetching voucher data for shop:", shopId);
      dispatchActions.push(dispatch(fetchVoucherData(shopId)));
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
  }, [isContextLoading, isContextReady, instance, shopId, hasAttemptedFetch, dispatch, consultants, voucherData]);

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
          isContextLoading={isContextLoading}
          isContextReady={isContextReady}
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
      isContextLoading={isContextLoading}
      isContextReady={isContextReady}
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
  isContextLoading,
  isContextReady,
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
        {isContextLoading || !isContextReady ? (
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
