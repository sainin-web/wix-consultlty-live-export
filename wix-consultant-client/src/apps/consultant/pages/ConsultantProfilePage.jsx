/**
 * Consultant Profile Editor
 */

import React, { useState } from 'react';
import ConsultantSidebar from '../components/ConsultantSidebar';
import '../styles/ConsultantProfilePage.css';

function ConsultantProfilePage() {
  const [profile, setProfile] = useState({
    fullname: '',
    profession: '',
    experience: '',
    languages: [],
    bio: '',
    profileImage: null,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="consultant-dashboard">
      <ConsultantSidebar />

      <main className="consultant-main">
        <div className="consultant-header">
          <h1>Edit Profile</h1>
        </div>

        {saved && <div className="success-message">Profile updated successfully!</div>}

        <form className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                value={profile.fullname}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Profession</label>
              <input
                type="text"
                name="profession"
                value={profile.profession}
                onChange={handleChange}
                placeholder="Your profession"
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell about yourself"
                rows="5"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing</h2>

            <div className="form-group">
              <label>Chat Rate (per minute)</label>
              <input type="number" placeholder="$5" />
            </div>

            <div className="form-group">
              <label>Voice Call Rate (per minute)</label>
              <input type="number" placeholder="$10" />
            </div>

            <div className="form-group">
              <label>Video Call Rate (per minute)</label>
              <input type="number" placeholder="$20" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
            <button type="button" className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ConsultantProfilePage;
