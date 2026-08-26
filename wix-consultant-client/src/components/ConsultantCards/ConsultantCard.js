import React, { useState } from "react";
import "./ConsultantCardNew.css";

/**
 * Professional marketplace consultant card.
 * Displays only real data from the database.
 */
export function ConsultantCard({
  consultant,
  onViewProfile,
  onChat,
  onCall,
  loading,
}) {
  const [imageError, setImageError] = useState(false);

  // DEBUG: Log consultant data
  console.log("[CONSULTANT-CARD-DEBUG] Card rendered with consultant:", {
    id: consultant?.id,
    name: consultant?.name,
    profession: consultant?.profession,
    isActive: consultant?.isActive,
    hasImage: !!consultant?.image,
    shop_id: consultant?.shop_id,
    fullData: consultant
  });

  if (!consultant) {
    console.warn("[CONSULTANT-CARD-DEBUG] No consultant data provided");
    return null;
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const defaultImage = "/images/flag/teamdefault.png";

  return (
    <div className="consultant-card">
      {/* Image Section */}
      <div className="consultant-card-image-wrapper">
        <img
          src={imageError ? defaultImage : consultant.image || defaultImage}
          alt={consultant.name}
          className="consultant-card-image"
          loading="lazy"
          onError={handleImageError}
        />
        {consultant.isActive && <div className="consultant-active-badge">Active</div>}
      </div>

      {/* Content Section */}
      <div className="consultant-card-content">
        {/* Header */}
        <div className="consultant-card-header">
          <h3 className="consultant-card-name">{consultant.name}</h3>
          {consultant.profession && (
            <p className="consultant-card-profession">{consultant.profession}</p>
          )}
        </div>

        {/* Metadata */}
        {(consultant.experience > 0 || consultant.languages?.length > 0) && (
          <div className="consultant-card-metadata">
            {consultant.experience > 0 && (
              <span className="consultant-metadata-item">
                {consultant.experience}+ years
              </span>
            )}
            {consultant.languages?.length > 0 && (
              <span className="consultant-metadata-item">
                {consultant.languages.join(", ")}
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        {(consultant.chatPrice || consultant.audioPrice || consultant.videoPrice) && (
          <div className="consultant-card-pricing">
            <p className="consultant-pricing-label">Starting from</p>
            <p className="consultant-pricing-value">
              {consultant.chatPrice || consultant.audioPrice || consultant.videoPrice}
              <span className="consultant-pricing-unit">/min</span>
            </p>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="consultant-card-actions">
        <button
          className="consultant-action-button consultant-action-primary"
          onClick={() => onViewProfile?.(consultant.shop_id, consultant.id)}
          disabled={loading}
        >
          View Profile
        </button>
        <div className="consultant-action-secondary-group">
          <button
            className="consultant-action-button consultant-action-icon"
            title="Chat"
            onClick={() => onChat?.(consultant.id)}
            disabled={loading || consultant.isBusy}
          >
            💬
          </button>
          <button
            className="consultant-action-button consultant-action-icon"
            title="Call"
            onClick={() => onCall?.({ receiverId: consultant.id, type: "voice" })}
            disabled={loading || consultant.isBusy}
          >
            📞
          </button>
          <button
            className="consultant-action-button consultant-action-icon"
            title="Video"
            onClick={() => onCall?.({ receiverId: consultant.id, type: "video" })}
            disabled={loading || consultant.isBusy}
          >
            📹
          </button>
        </div>
      </div>

      {/* Busy Indicator */}
      {consultant.isBusy && (
        <div className="consultant-busy-overlay">
          <span>Busy</span>
        </div>
      )}
    </div>
  );
}
