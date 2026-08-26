/**
 * Consultant Earnings & Wallet
 */

import { useSelector } from 'react-redux';
import '../styles/ConsultantEarningsPage.css';

function ConsultantEarningsPage() {
  const earnings = useSelector((state) => state.earnings);

  return (
    <>
      <div className="consultant-header">
        <h1>Earnings & Wallet</h1>
      </div>

        <div className="earnings-summary">
          <div className="earnings-card">
            <h3>Available Balance</h3>
            <p className="amount">${earnings.balance.toFixed(2)}</p>
            <button className="btn-secondary">Withdraw</button>
          </div>

          <div className="earnings-card">
            <h3>Total Earned</h3>
            <p className="amount">${earnings.totalEarnings.toFixed(2)}</p>
          </div>

          <div className="earnings-card">
            <h3>This Month</h3>
            <p className="amount">$0.00</p>
          </div>
        </div>

        <div className="transactions-section">
          <h2>Transaction History</h2>

          {earnings.transactions && earnings.transactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings.transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.type}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                    <td>
                      <span className="status-badge">{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No transactions yet</p>
          )}
        </div>
    </>
  );
}

export default ConsultantEarningsPage;
