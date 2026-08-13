/**
 * STOREFRONT API CLIENT
 *
 * Dedicated lightweight API client for public marketplace.
 * Only calls /api/storefront/consultants endpoint.
 *
 * Does NOT include:
 * - Authentication APIs
 * - Chat APIs
 * - Call APIs
 * - Admin APIs
 */

import axios from 'axios';
import { perfMark, perfMeasure } from '../utils/performanceMonitor';

const API_BASE = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:5000';
const STOREFRONT_API = `${API_BASE}/api/storefront`;

/**
 * Fetch consultants for storefront listing
 *
 * GET /api/storefront/consultants?page=1&limit=20&shop_id=XXX
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 50)
 * - shop_id: string (Wix shop/instance ID)
 *
 * Returns:
 * {
 *   success: true,
 *   consultants: [
 *     {
 *       id: "...",
 *       name: "...",
 *       profileImage: "...",
 *       profession: "...",
 *       experience: "...",
 *       languages: [],
 *       chatPerMinute: 5,
 *       voicePerMinute: 10,
 *       videoPerMinute: 20,
 *       isActive: true
 *     }
 *   ],
 *   pagination: {
 *     page: 1,
 *     limit: 20,
 *     total: 150,
 *     hasMore: true
 *   }
 * }
 */
export const fetchConsultantListing = async (params = {}) => {
  const {
    page = 1,
    limit = 20,
    shop_id = '',
    instance = '',
  } = params;

  perfMark('storefront-api-consultants-start');

  try {
    const config = {
      params: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(50, Math.max(1, parseInt(limit))),
        shop_id: shop_id || undefined,
      },
    };

    // Include instance in authorization header if available
    if (instance) {
      config.headers = {
        Authorization: `Bearer ${instance}`,
      };
    }

    const response = await axios.get(
      `${STOREFRONT_API}/consultants`,
      config
    );

    perfMark('storefront-api-consultants-end');
    perfMeasure(
      'storefront-api-consultants-start',
      'storefront-api-consultants-end'
    );

    if (!response.data?.success) {
      throw new Error('API returned success=false');
    }

    return {
      success: true,
      consultants: response.data.consultants || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
      },
    };
  } catch (error) {
    perfMark('storefront-api-consultants-error');
    console.error('[STOREFRONT-API] Error:', error?.message || error);
    throw error;
  }
};

/**
 * Fetch single consultant profile
 *
 * GET /api/storefront/consultant/:id
 */
export const fetchConsultantProfile = async (consultantId) => {
  perfMark(`storefront-api-profile-${consultantId}-start`);

  try {
    const response = await axios.get(
      `${STOREFRONT_API}/consultant/${consultantId}`
    );

    perfMark(`storefront-api-profile-${consultantId}-end`);
    perfMeasure(
      `storefront-api-profile-${consultantId}-start`,
      `storefront-api-profile-${consultantId}-end`
    );

    if (!response.data?.success) {
      throw new Error('API returned success=false');
    }

    return {
      success: true,
      consultant: response.data.consultant || null,
    };
  } catch (error) {
    console.error(
      `[STOREFRONT-API] Error fetching profile ${consultantId}:`,
      error?.message || error
    );
    throw error;
  }
};

export default {
  fetchConsultantListing,
  fetchConsultantProfile,
};
