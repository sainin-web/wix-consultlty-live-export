/**
 * Customer Transactions Page
 */

import React from 'react';
import CustomerSidebar from '../components/CustomerSidebar';
import '../styles/CustomerTransactionsPage.css';

function CustomerTransactionsPage() {
  const [transactions] = React.useState([
    { id: 1, date: '2026-08-13', description: 'Video call with John Doe', amount: '-$7.50', type: 'debit' },
    { id: 2, date: '2026-08-12', description: 'Chat with Jane Smith', amount: '-$2.50', type: 'debit' },
    { id: 3, date: '2026-08-11', description: 'Voucher purchase - 100 mins', amount: '-$50.00', type: 'debit' },
    { id: 4, date: '2026-08-10', description: 'Wallet top-up', amount: '+$100.00', type: 'credit' },
  ]);

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <main className="customer-main">
        <div className="customer-header">
          <h1>Transaction History</h1>
        </div>

        <div className="transactions-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span className={`type-badge ${tx.type}`}>
                      {tx.type === 'debit' ? '💸 Debit' : '💰 Credit'}
                    </span>
                  </td>
                  <td className={`amount ${tx.type}`}>{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default CustomerTransactionsPage;
