/**
 * STOREFRONT ROUTES
 *
 * Dedicated routes for public consultant marketplace.
 *
 * Routes:
 * - GET /api/storefront/consultants
 * - GET /api/storefront/consultant/:id
 */

const express = require('express');
const {
  getStorefrontConsultants,
  getStorefrontConsultantProfile,
} = require('../Controller/storefrontController');

const storefrontRoute = express.Router();

// List consultants
storefrontRoute.get('/consultants', getStorefrontConsultants);

// Single consultant profile
storefrontRoute.get('/consultant/:id', getStorefrontConsultantProfile);

module.exports = { storefrontRoute };
