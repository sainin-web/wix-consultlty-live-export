/**
 * CONSULTANT LISTING PAGE
 *
 * Public consultant marketplace.
 *
 * Flow:
 * 1. Component mounts
 * 2. Shell renders immediately with skeleton cards
 * 3. API call starts (async, non-blocking)
 * 4. Consultants fetch
 * 5. Cards populate as data arrives
 *
 * DOES NOT:
 * - Wait for socket
 * - Wait for authentication
 * - Block on API response
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchStart, fetchSuccess, fetchError } from '../store/storefrontStore';
import { fetchConsultantListing } from '../api/storefrontApi';
import { perfMark, perfMeasure } from '../utils/performanceMonitor';
import ConsultantListing from '../components/ConsultantListing';
import ConsultantSkeleton from '../components/ConsultantSkeleton';
import '../styles/ConsultantListingPage.css';

function ConsultantListingPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { consultants, loading, error, page, total, hasMore } = useSelector(
    (state) => state.consultants
  );

  const shop_id = searchParams.get('shop_id') || localStorage.getItem('wix_id');
  const instance = searchParams.get('instance') || localStorage.getItem('wix_instance');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch consultants on mount
  useEffect(() => {
    perfMark('consultant-listing-page-mount');

    if (!shop_id) {
      console.warn('[STOREFRONT-LISTING] No shop_id available');
      return;
    }

    // Check if already cached (avoid duplicate fetches)
    if (consultants.length > 0) {
      console.log('[STOREFRONT-LISTING] Using cached consultants:', consultants.length);
      perfMeasure('consultant-listing-page-mount', 'consultant-listing-page-mount');
      return;
    }

    // Fetch consultants
    const fetchData = async () => {
      dispatch(fetchStart());
      perfMark('consultant-listing-api-start');

      try {
        const result = await fetchConsultantListing({
          page: 1,
          limit: 20,
          shop_id,
          instance,
        });

        perfMark('consultant-listing-api-success');
        perfMeasure('consultant-listing-api-start', 'consultant-listing-api-success');

        if (result.success) {
          dispatch(
            fetchSuccess({
              consultants: result.consultants,
              page: result.pagination.page,
              limit: result.pagination.limit,
              total: result.pagination.total,
              hasMore: result.pagination.hasMore,
            })
          );

          console.log(
            '[STOREFRONT-LISTING] Loaded',
            result.consultants.length,
            'consultants'
          );

          perfMark('consultant-listing-page-render');
          perfMeasure('consultant-listing-page-mount', 'consultant-listing-page-render');
        } else {
          throw new Error('API returned success=false');
        }
      } catch (err) {
        console.error('[STOREFRONT-LISTING] Error:', err?.message || err);
        dispatch(fetchError(err?.message || 'Failed to load consultants'));
        perfMark('consultant-listing-api-error');
      } finally {
        setIsInitialLoad(false);
      }
    };

    // Start fetch immediately (non-blocking)
    fetchData();
  }, [shop_id, dispatch, consultants.length]);

  // Render state
  const isEmpty = !loading && consultants.length === 0;
  const hasError = error && !loading;

  return (
    <div className="consultant-listing-page">
      {/* Hero Section */}
      <section className="consultant-listing-hero">
        <h1>Find the Right Consultant</h1>
        <p>Connect with experienced professionals ready to help</p>
      </section>

      {/* Content Section */}
      <section className="consultant-listing-content">
        {/* Loading State - Show skeleton immediately */}
        {(loading || isInitialLoad) && consultants.length === 0 && (
          <div className="consultant-listing-skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <ConsultantSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="consultant-listing-error" role="alert">
            <h2>Unable to Load Consultants</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="consultant-listing-retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="consultant-listing-empty" role="status">
            <h2>No Consultants Available</h2>
            <p>Please check back soon</p>
          </div>
        )}

        {/* Consultant Grid */}
        {consultants.length > 0 && (
          <>
            <div className="consultant-listing-header">
              <h2>Available Consultants</h2>
              <span className="consultant-listing-count">
                {consultants.length} of {total} consultants
              </span>
            </div>

            <ConsultantListing consultants={consultants} />

            {/* Load More Button */}
            {hasMore && (
              <div className="consultant-listing-load-more">
                <button className="consultant-listing-load-btn">
                  Load More Consultants
                </button>
              </div>
            )}
          </>
        )}

        {/* Still loading (after initial render) */}
        {loading && consultants.length > 0 && (
          <div className="consultant-listing-loading-more">
            <p>Loading more consultants...</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ConsultantListingPage;
