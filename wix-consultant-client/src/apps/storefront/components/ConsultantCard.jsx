/**
 * CONSULTANT CARD
 *
 * Displays single consultant card with:
 * - Profile image (lazy-loaded)
 * - Name
 * - Profession
 * - Experience
 * - Languages
 * - Pricing
 * - Action buttons
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ConsultantCard.css';

function ConsultantCard({ consultant, onViewProfile }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleChat = (e) => {
    e.preventDefault();
    console.log('[STOREFRONT] Chat clicked for:', consultant.name);
    // Would typically redirect to login or start chat
    // navigate('/login');
  };

  const handleCall = (e) => {
    e.preventDefault();
    console.log('[STOREFRONT] Call clicked for:', consultant.name);
    // Would typically redirect to login or start call
    // navigate('/login');
  };

  return (
    <div className="consultant-card">
      {/* Profile Image */}
      <div className="consultant-card-image-wrapper">
        {consultant.profileImage && (
          <img
            src={consultant.profileImage}
            alt={consultant.name}
            className={`consultant-card-image ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        )}
        {!imageLoaded && <div className="consultant-card-image-placeholder" />}

        {consultant.isActive && (
          <span className="consultant-online-badge">Online</span>
        )}
      </div>

      {/* Info Section */}
      <div className="consultant-card-info">
        <h3 className="consultant-card-name">{consultant.name}</h3>

        {consultant.profession && (
          <p className="consultant-card-profession">{consultant.profession}</p>
        )}

        {consultant.experience && (
          <p className="consultant-card-experience">
            {consultant.experience} years experience
          </p>
        )}

        {consultant.languages && consultant.languages.length > 0 && (
          <div className="consultant-card-languages">
            {consultant.languages.map((lang, idx) => (
              <span key={idx} className="language-badge">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Section */}
      {(consultant.chatPerMinute ||
        consultant.voicePerMinute ||
        consultant.videoPerMinute) && (
        <div className="consultant-card-pricing">
          {consultant.chatPerMinute && (
            <div className="pricing-row">
              <span>Chat:</span>
              <strong>${consultant.chatPerMinute}/min</strong>
            </div>
          )}
          {consultant.voicePerMinute && (
            <div className="pricing-row">
              <span>Voice:</span>
              <strong>${consultant.voicePerMinute}/min</strong>
            </div>
          )}
          {consultant.videoPerMinute && (
            <div className="pricing-row">
              <span>Video:</span>
              <strong>${consultant.videoPerMinute}/min</strong>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="consultant-card-actions">
        <button
          className="btn btn-outline"
          onClick={onViewProfile}
          aria-label={`View ${consultant.name} profile`}
        >
          View Profile
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleChat}
          title="Start chat with consultant"
        >
          💬 Chat
        </button>

        <button
          className="btn btn-primary"
          onClick={handleCall}
          title="Start call with consultant"
        >
          📞 Call
        </button>
      </div>
    </div>
  );
}

export default ConsultantCard;
