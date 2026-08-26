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
  console.log('🟢🟢🟢 [CONSULTANT-LISTING-PAGE] COMPONENT RENDERED! 🟢🟢🟢');

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { consultants, loading, error, page, total, hasMore } = useSelector(
    (state) => state.consultants
  );

  const shop_id = searchParams.get('shop_id') || localStorage.getItem('wix_id');
  const instance = searchParams.get('instance') || localStorage.getItem('wix_instance');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  console.log('🟢 [CONSULTANT-LISTING-PAGE] INITIAL STATE:', { shop_id, instance, consultants: consultants.length, loading, error });

  // Fetch consultants on mount
  useEffect(() => {
    perfMark('consultant-listing-page-mount');

    console.log('🔍 [STOREFRONT-LISTING] ===========================================');
    console.log('🔍 [STOREFRONT-LISTING] CONSULTANT LISTING COMPONENT MOUNTED');
    console.log('🔍 [STOREFRONT-LISTING] shop_id:', shop_id);
    console.log('🔍 [STOREFRONT-LISTING] instance:', instance ? instance.slice(0, 30) + '...' : 'undefined');
    console.log('🔍 [STOREFRONT-LISTING] cached consultants:', consultants.length);
    console.log('🔍 [STOREFRONT-LISTING] ===========================================');

    if (!shop_id) {
      console.error('🔴 [STOREFRONT-LISTING] CRITICAL: No shop_id available - cannot fetch consultants');
      return;
    }

    // Check if already cached (avoid duplicate fetches)
    if (consultants.length > 0) {
      console.log('✅ [STOREFRONT-LISTING] Using cached consultants:', consultants.length);
      perfMeasure('consultant-listing-page-mount', 'consultant-listing-page-mount');
      return;
    }

    // Fetch consultants
    const fetchData = async () => {
      dispatch(fetchStart());
      perfMark('consultant-listing-api-start');

      console.log('📡 [STOREFRONT-LISTING] Starting API call with params:', {
        page: 1,
        limit: 20,
        shop_id,
        instance: instance ? instance.slice(0, 30) + '...' : 'none',
      });

      try {
        const result = await fetchConsultantListing({
          page: 1,
          limit: 20,
          shop_id,
          instance,
        });

        perfMark('consultant-listing-api-success');
        perfMeasure('consultant-listing-api-start', 'consultant-listing-api-success');

        console.log('🟢 [STOREFRONT-LISTING] API Response received:', {
          success: result.success,
          consultantCount: result.consultants?.length,
          pagination: result.pagination,
          consultants: result.consultants,
        });

        if (result.success) {
          console.log('✨ [STOREFRONT-LISTING] Dispatching fetchSuccess to Redux...');
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
            '✅ [STOREFRONT-LISTING] Successfully loaded',
            result.consultants.length,
            'consultants'
          );

          perfMark('consultant-listing-page-render');
          perfMeasure('consultant-listing-page-mount', 'consultant-listing-page-render');
        } else {
          throw new Error('API returned success=false');
        }
      } catch (err) {
        console.error('❌ [STOREFRONT-LISTING] FETCH ERROR:', {
          message: err?.message || err,
          error: err,
        });
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
      {/* DEBUG BOX - DEV ONLY */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: '400px',
          maxHeight: '400px',
          overflow: 'auto',
          backgroundColor: '#1e1e1e',
          color: '#00ff00',
          border: '2px solid #00ff00',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 9999,
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ffff00' }}>DEBUG BOX</div>
          <div><strong>shop_id:</strong> {shop_id || 'MISSING'}</div>
          <div><strong>instance:</strong> {instance ? instance.slice(0, 30) + '...' : 'MISSING'}</div>
          <div><strong>loading:</strong> {loading.toString()}</div>
          <div><strong>error:</strong> {error || 'none'}</div>
          <div><strong>consultants:</strong> {consultants.length}</div>
          <div><strong>total:</strong> {total}</div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #00ff00' }}>
            <strong>Redux State:</strong>
            <pre style={{ fontSize: '9px', margin: '4px 0', color: '#00ff00' }}>
              {JSON.stringify({ consultants: consultants.length, page, total, hasMore, loading, error }, null, 2)}
            </pre>
          </div>
        </div>
      )}

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
