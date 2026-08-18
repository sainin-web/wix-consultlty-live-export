/**
 * SMART ENTRY POINT SELECTOR
 *
 * This file determines which entry point to use at runtime:
 * - PUBLIC WIDGET (index.js) for Wix Site Widget
 * - ADMIN DASHBOARD (admin-index.js) for Wix Dashboard extension
 *
 * This prevents the public widget from ever loading inside the admin area.
 */

import { isWixAdminContext, getContextInfo } from './utils/contextDetector';

console.log("════════════════════════════════════════════════════════════");
console.log("ENTRY POINT SELECTOR");
console.log("════════════════════════════════════════════════════════════");
console.log("Context Info:", getContextInfo());
console.log("════════════════════════════════════════════════════════════");

if (isWixAdminContext()) {
  console.log("\n[🔐 ENTRY POINT] Loading ADMIN DASHBOARD...\n");
  require('./admin-index.js');
} else {
  console.log("\n[🌐 ENTRY POINT] Loading PUBLIC WIDGET...\n");
  require('./index.js');
}
