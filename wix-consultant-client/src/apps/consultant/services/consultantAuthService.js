/**
 * CONSULTANT AUTHENTICATION SERVICE
 *
 * Handles all consultant login/logout API calls.
 * Single source of truth for authentication endpoints.
 */

import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:5000';
const CONSULTANT_API = `${API_BASE}/api-consultant`;

/**
 * Login consultant with email/password
 *
 * POST /api-consultant/login-consultant
 * Body: { email, password }
 *
 * Returns: { success, token, userData, secure_url }
 */
export const loginConsultant = async (email, password) => {
  try {
    console.log('[CONSULTANT-AUTH] LOGIN REQUEST:', { email, endpoint: `${CONSULTANT_API}/login-consultant` });

    const response = await axios.post(`${CONSULTANT_API}/login-consultant`, {
      email,
      password,
    });

    console.log('[CONSULTANT-AUTH] LOGIN SUCCESS:', {
      success: response.data.success,
      token: response.data.token ? response.data.token.slice(0, 20) + '...' : null,
      userId: response.data.userData?._id,
      email: response.data.userData?.email,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    return {
      success: true,
      token: response.data.token,
      user: response.data.userData,
      storeUrl: response.data.secure_url,
    };
  } catch (error) {
    console.error('[CONSULTANT-AUTH] LOGIN ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

/**
 * Verify token validity
 *
 * GET /api-consultant/verify-token
 * Headers: { Authorization: "Bearer {token}" }
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${CONSULTANT_API}/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.success === true;
  } catch (error) {
    console.log('[CONSULTANT-AUTH] Token verification failed');
    return false;
  }
};

/**
 * Refresh consultant session by verifying token
 */
export const refreshSession = async (token) => {
  if (!token) return null;

  const isValid = await verifyToken(token);
  if (isValid) {
    return token;
  }

  return null;
};

export default {
  loginConsultant,
  verifyToken,
  refreshSession,
};
