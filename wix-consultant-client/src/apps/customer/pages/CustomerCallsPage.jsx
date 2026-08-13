/**
 * Customer Upcoming Calls Page
 */

import React from 'react';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerCallsPage.css';

function CustomerCallsPage() {
  const [calls] = React.useState([
    { id: 1, consultant: 'John Doe', date: '2026-08-15', time: '14:00', type: 'video' },
    { id: 2, consultant: 'Jane Smith', date: '2026-08-16', time: '10:30', type: 'call' },
  ]);

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>Upcoming Calls</h1>
        </div>

        {calls.length > 0 ? (
          <div className="calls-container">
            {calls.map((call) => (
              <div key={call.id} className="call-card">
                <div className="call-info">
                  <h3>{call.consultant}</h3>
                  <p className="call-type">
                    {call.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                  </p>
                  <p className="call-time">
                    📅 {call.date} at {call.time}
                  </p>
                </div>
                <div className="call-actions">
                  <button className="btn-primary">Join Call</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No upcoming calls scheduled</p>
            <button className="btn-primary">Schedule a Call</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerCallsPage;
