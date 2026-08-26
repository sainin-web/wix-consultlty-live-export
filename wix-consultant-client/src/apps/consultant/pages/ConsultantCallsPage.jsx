/**
 * Consultant Calls & Chat History
 */

import React from 'react';
import '../styles/ConsultantCallsPage.css';

function ConsultantCallsPage() {
  const [logs] = React.useState([
    { id: 1, type: 'call', user: 'John Doe', date: '2026-08-13', duration: '15 min', amount: '$7.50' },
    { id: 2, type: 'chat', user: 'Jane Smith', date: '2026-08-13', duration: '5 min', amount: '$2.50' },
    { id: 3, type: 'video', user: 'Mike Johnson', date: '2026-08-12', duration: '20 min', amount: '$10.00' },
  ]);

  return (
    <>
      <div className="consultant-header">
        <h1>Calls & Chat History</h1>
      </div>

        <div className="calls-container">
          <table className="calls-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`type-badge ${log.type}`}>
                      {log.type === 'call' && '📞'}
                      {log.type === 'chat' && '💬'}
                      {log.type === 'video' && '📹'}
                      {log.type}
                    </span>
                  </td>
                  <td>{log.user}</td>
                  <td>{log.date}</td>
                  <td>{log.duration}</td>
                  <td className="amount">{log.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  );
}

export default ConsultantCallsPage;
