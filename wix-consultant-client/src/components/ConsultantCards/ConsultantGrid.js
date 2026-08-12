import React from "react";
import { ConsultantCard } from "./ConsultantCard";
import "./ConsultantGrid.css";

/**
 * Responsive grid of consultant cards.
 */
export function ConsultantGrid({
  consultants,
  onViewProfile,
  onChat,
  onCall,
  loading,
}) {
  if (!consultants || consultants.length === 0) {
    return null;
  }

  return (
    <div className="consultant-grid-wrapper">
      <div className="consultant-grid">
        {consultants.map((consultant) => (
          <ConsultantCard
            key={consultant.id}
            consultant={consultant}
            onViewProfile={onViewProfile}
            onChat={onChat}
            onCall={onCall}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
