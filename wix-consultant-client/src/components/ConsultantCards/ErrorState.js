import React from "react";

export function ErrorState({ onRetry }) {
  return (
    <div className="consultant-error-state">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Consultants</h3>
        <p>Something went wrong while loading the consultant list. Please try again.</p>
        {onRetry && (
          <button className="error-retry-button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
