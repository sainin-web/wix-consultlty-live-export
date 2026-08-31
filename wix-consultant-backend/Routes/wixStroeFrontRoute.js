const express = require("express");
const {
  getAllConsultantWixStoreFront,
  buyVoucherController,
} = require("../Controller/wixStroeFrontController");
const { getWixContext } = require("../Controller/wixContextController");
const wixStroeFrontRoute = express.Router();

// Get Wix context (authentication, shop ID, instance)
wixStroeFrontRoute.get(
  "/wix-context",
  getWixContext,
);

// Fetch consultants for storefront
wixStroeFrontRoute.get(
  "/consultant/wix-store-front",
  getAllConsultantWixStoreFront,
);

// Buy voucher
wixStroeFrontRoute.post(
  "/buy-voucher/:adminId",
  buyVoucherController,
);

module.exports = {wixStroeFrontRoute};
  