/**
 * Loading component
 */

export default function CustomerLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #0066cc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p>Loading member portal...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
