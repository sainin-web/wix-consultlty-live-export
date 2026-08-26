/**
 * Consultant Login Page
 *
 * Authenticates consultant with real backend API.
 * On successful login, redirects immediately to dashboard.
 * Dashboard loads its own data after navigation (don't block on API).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginConsultant } from '../services/consultantAuthService';
import '../styles/ConsultantLoginPage.css';

function ConsultantLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('consultant_logged_in') === 'true';

    if (token && isLoggedIn) {
      console.log('[CONSULTANT-LOGIN] Already authenticated, redirecting to dashboard');
      navigate('/consultant/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[CONSULTANT-LOGIN] Logging in consultant:', email);

      // Call real backend API
      const response = await loginConsultant(email, password);

      if (response.success && response.token) {
        // Save authentication state
        localStorage.setItem('consultant_logged_in', 'true');
        localStorage.setItem('token', response.token);
        localStorage.setItem('consultant_user', JSON.stringify({
          id: response.user._id,
          email: response.user.email,
          fullname: response.user.fullname,
          profession: response.user.profession,
        }));
        localStorage.setItem('wix_c_Identity', response.user._id);
        localStorage.setItem('wix_id', response.user.shop_id);

        console.log('[CONSULTANT-LOGIN] Authentication successful, redirecting...');

        // Immediately navigate - don't wait for dashboard data
        setRedirecting(true);
        navigate('/consultant/dashboard', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please try again.';
      console.error('[CONSULTANT-LOGIN] ERROR:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="consultant-login-container">
        <div className="consultant-login-box">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '20px' }}>🔄</div>
            <p style={{ fontSize: '18px', color: '#333' }}>Redirecting to dashboard...</p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>Just a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="consultant-login-container">
      <div className="consultant-login-box">
        <h1>Consultant Login</h1>
        <p className="subtitle">Access your consultant dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '🔄 Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          New consultant? <Link to="/consultant/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default ConsultantLoginPage;
