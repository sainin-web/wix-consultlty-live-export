/**
 * CONSULTANT PROFILE PAGE
 *
 * Displays detailed consultant profile when user clicks a card.
 *
 * Loads from:
 * 1. Cache (already fetched from listing)
 * 2. API if not cached
 *
 * Does NOT require authentication to VIEW.
 * Requires authentication to CONTACT.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchConsultantProfile } from '../api/storefrontApi';
import { perfMark, perfMeasure } from '../utils/performanceMonitor';
import '../styles/ConsultantProfilePage.css';

function ConsultantProfilePage() {
  const { consultant_id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Try to get from Redux cache first
  const cachedConsultant = useSelector((state) =>
    state.consultants.consultants.find((c) => c.id === consultant_id)
  );

  useEffect(() => {
    perfMark('consultant-profile-page-mount');

    // If we have cached data, use it immediately
    if (cachedConsultant) {
      console.log('[STOREFRONT-PROFILE] Using cached consultant');
      setProfile(cachedConsultant);
      setLoading(false);
      perfMeasure('consultant-profile-page-mount', 'consultant-profile-page-mount');
      return;
    }

    // Otherwise fetch from API
    const fetchProfile = async () => {
      try {
        perfMark('consultant-profile-api-start');
        const result = await fetchConsultantProfile(consultant_id);

        perfMark('consultant-profile-api-end');
        perfMeasure('consultant-profile-api-start', 'consultant-profile-api-end');

        if (result.success && result.consultant) {
          setProfile(result.consultant);
        } else {
          setError('Consultant not found');
        }
      } catch (err) {
        console.error('[STOREFRONT-PROFILE] Error:', err);
        setError(err?.message || 'Failed to load consultant');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [consultant_id, cachedConsultant]);

  if (loading) {
    return (
      <div className="consultant-profile-loading">
        <div className="spinner" />
        <p>Loading consultant profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultant-profile-error" role="alert">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/consultant/card')}>
          Back to Consultants
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="consultant-profile-empty" role="status">
        <h2>Consultant Not Found</h2>
        <button onClick={() => navigate('/consultant/card')}>
          Back to Consultants
        </button>
      </div>
    );
  }

  return (
    <div className="consultant-profile-container">
      <button
        onClick={() => navigate('/consultant/card')}
        className="consultant-profile-back-btn"
      >
        ← Back to Consultants
      </button>

      <div className="consultant-profile-header">
        {profile.profileImage && (
          <img
            src={profile.profileImage}
            alt={profile.name}
            className="consultant-profile-image"
            loading="lazy"
          />
        )}
        <div className="consultant-profile-info">
          <h1>{profile.name}</h1>
          <p className="consultant-profession">{profile.profession}</p>
          {profile.experience && (
            <p className="consultant-experience">
              {profile.experience} years experience
            </p>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <p className="consultant-languages">
              Languages: {profile.languages.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="consultant-profile-pricing">
        <h2>Pricing</h2>
        <div className="pricing-grid">
          {profile.chatPerMinute !== undefined && (
            <div className="pricing-item">
              <span>Chat</span>
              <strong>${profile.chatPerMinute}/min</strong>
            </div>
          )}
          {profile.voicePerMinute !== undefined && (
            <div className="pricing-item">
              <span>Voice Call</span>
              <strong>${profile.voicePerMinute}/min</strong>
            </div>
          )}
          {profile.videoPerMinute !== undefined && (
            <div className="pricing-item">
              <span>Video Call</span>
              <strong>${profile.videoPerMinute}/min</strong>
            </div>
          )}
        </div>
      </div>

      <div className="consultant-profile-actions">
        <button className="btn btn-primary">Start Chat</button>
        <button className="btn btn-secondary">Schedule Call</button>
      </div>
    </div>
  );
}

export default ConsultantProfilePage;
