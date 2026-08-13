/**
 * Customer Call History Page
 */

import React from 'react';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerHistoryPage.css';

function CustomerHistoryPage() {
  const [history] = React.useState([
    { id: 1, type: 'call', consultant: 'John Doe', date: '2026-08-13', duration: '15 min', cost: '$7.50' },
    { id: 2, type: 'chat', consultant: 'Jane Smith', date: '2026-08-13', duration: '5 min', cost: '$2.50' },
    { id: 3, type: 'video', consultant: 'Mike Johnson', date: '2026-08-12', duration: '20 min', cost: '$10.00' },
    { id: 4, type: 'call', consultant: 'Sarah Williams', date: '2026-08-11', duration: '10 min', cost: '$5.00' },
  ]);

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>Call History</h1>
        </div>

        <div className="history-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Consultant</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`type-badge ${item.type}`}>
                      {item.type === 'call' && '📞'}
                      {item.type === 'chat' && '💬'}
                      {item.type === 'video' && '📹'}
                      {item.type}
                    </span>
                  </td>
                  <td>{item.consultant}</td>
                  <td>{item.date}</td>
                  <td>{item.duration}</td>
                  <td className="cost">{item.cost}</td>
                  <td>
                    <button className="action-link">Call Again</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default CustomerHistoryPage;
