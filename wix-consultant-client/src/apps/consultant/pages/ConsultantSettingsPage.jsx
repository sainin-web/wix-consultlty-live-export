/**
 * Consultant Settings
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultantSidebar from '../components/ConsultantSidebar';
import '../styles/ConsultantSettingsPage.css';

function ConsultantSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoAcceptCalls: false,
  });

  const handleLogout = () => {
    localStorage.removeItem('consultant_logged_in');
    localStorage.removeItem('token');
    navigate('/consultant/login');
  };

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="consultant-dashboard">
      <ConsultantSidebar />

      <main className="consultant-main">
        <div className="consultant-header">
          <h1>Settings</h1>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <div>
              <h3>Enable Notifications</h3>
              <p>Get notifications for incoming calls and chats</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
          </div>

          <div className="setting-item">
            <div>
              <h3>Email Updates</h3>
              <p>Receive email updates about your earnings and activity</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailUpdates}
              onChange={() => handleToggle('emailUpdates')}
            />
          </div>

          <div className="setting-item">
            <div>
              <h3>Auto Accept Calls</h3>
              <p>Automatically accept incoming calls when available</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoAcceptCalls}
              onChange={() => handleToggle('autoAcceptCalls')}
            />
          </div>
        </div>

        <div className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <button className="btn-danger" onClick={handleLogout}>
            Logout
          </button>
          <button className="btn-danger">Delete Account</button>
        </div>
      </main>
    </div>
  );
}

export default ConsultantSettingsPage;
