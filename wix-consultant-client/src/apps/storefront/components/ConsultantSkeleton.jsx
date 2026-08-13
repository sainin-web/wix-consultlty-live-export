/**
 * CONSULTANT CARD SKELETON
 *
 * Loading skeleton shown while consultants are being fetched.
 * Helps user understand what's coming.
 */

import '../styles/ConsultantSkeleton.css';

function ConsultantSkeleton() {
  return (
    <div className="consultant-skeleton">
      {/* Image Skeleton */}
      <div className="skeleton-image" />

      {/* Info Skeleton */}
      <div className="skeleton-info">
        <div className="skeleton-line skeleton-name" />
        <div className="skeleton-line skeleton-profession" />
        <div className="skeleton-line skeleton-experience" />
        <div className="skeleton-languages">
          <div className="skeleton-badge" />
          <div className="skeleton-badge" />
        </div>
      </div>

      {/* Pricing Skeleton */}
      <div className="skeleton-pricing">
        <div className="skeleton-price-row" />
        <div className="skeleton-price-row" />
        <div className="skeleton-price-row" />
      </div>

      {/* Buttons Skeleton */}
      <div className="skeleton-buttons">
        <div className="skeleton-button" />
        <div className="skeleton-button" />
        <div className="skeleton-button" />
      </div>
    </div>
  );
}

export default ConsultantSkeleton;
