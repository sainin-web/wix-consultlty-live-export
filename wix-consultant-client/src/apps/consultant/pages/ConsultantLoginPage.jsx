/**
 * Consultant Login Page
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ConsultantLoginPage.css';

function ConsultantLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate login - replace with actual API call
      if (email && password.length >= 6) {
        localStorage.setItem('consultant_logged_in', 'true');
        localStorage.setItem('token', 'fake-token-' + Date.now());
        localStorage.setItem('consultant_user', JSON.stringify({ email }));
        navigate('/consultant/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
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
