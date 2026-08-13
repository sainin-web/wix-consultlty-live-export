/**
 * Customer Profile Page
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerProfilePage.css';

function CustomerProfilePage() {
  const auth = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    firstName: auth.user?.name || '',
    lastName: '',
    email: auth.user?.email || '',
    phone: '',
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>My Profile</h1>
        </div>

        {saved && <div className="success-message">Profile updated!</div>}

        <form className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CustomerProfilePage;
