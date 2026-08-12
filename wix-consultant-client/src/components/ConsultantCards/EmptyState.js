import React from "react";

export function EmptyState() {
  return (
    <div className="consultant-empty-state">
      <div className="empty-content">
        <div className="empty-icon">👥</div>
        <h3>No Consultants Available</h3>
        <p>There are currently no consultants available. Please check back later.</p>
      </div>
    </div>
  );
}
