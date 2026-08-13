/**
 * CONSULTANT LISTING
 *
 * Renders grid of consultant cards.
 * Handles:
 * - Responsive layout
 * - Image lazy loading
 * - Card interactions (view profile, contact)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultantCard from './ConsultantCard';
import '../styles/ConsultantListing.css';

function ConsultantListing({ consultants = [] }) {
  const navigate = useNavigate();

  const handleViewProfile = (consultant) => {
    navigate(`/view-profile/${consultant.shop_id}/${consultant.id}`);
  };

  if (!consultants || consultants.length === 0) {
    return null;
  }

  return (
    <div className="consultant-listing-grid">
      {consultants.map((consultant) => (
        <ConsultantCard
          key={consultant.id}
          consultant={consultant}
          onViewProfile={() => handleViewProfile(consultant)}
        />
      ))}
    </div>
  );
}

export default ConsultantListing;
