/**
 * Consultant Registration Page
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ConsultantRegisterPage.css';

function ConsultantRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    profession: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Simulate registration
      localStorage.setItem('consultant_logged_in', 'true');
      localStorage.setItem('token', 'fake-token-' + Date.now());
      localStorage.setItem('consultant_user', JSON.stringify({ email: formData.email }));
      navigate('/consultant/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultant-register-container">
      <div className="consultant-register-box">
        <h1>Become a Consultant</h1>
        <p className="subtitle">Create your consultant account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Profession</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Your profession"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="login-link">
          Already a consultant? <Link to="/consultant/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ConsultantRegisterPage;
