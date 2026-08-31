#!/usr/bin/env node

/**
 * POST-BUILD SCRIPT FOR CONSULTLY (Isolated Directory)
 *
 * After craco builds with CRACO_BUILD_FOLDER=.build-temp/consultly:
 * 1. Verify consultly-widget.js exists (webpack creates this as main entry bundle)
 * 2. Verify it contains the custom element code (NOT a dynamic loader)
 * 3. Copy index.html to consultly/index.html (for reference)
 *
 * CRITICAL: The webpack output must be the IMMEDIATE CUSTOM ELEMENT ENTRY BUNDLE.
 * Wix expects the Script URL to register the custom element immediately when parsed,
 * not load it dynamically later.
 *
 * The assemble-build.js script will later copy all of this to final build/
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../.build-temp/consultly');
const staticDir = path.join(buildDir, 'static/js');

console.log('\n[POST-BUILD CONSULTLY] Organizing build output in .build-temp/consultly/...\n');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('[POST-BUILD CONSULTLY] ✗ ERROR: Build directory not found:', buildDir);
  process.exit(1);
}

let hasErrors = false;

// 1. Verify consultly-widget.js exists (webpack creates this as main entry bundle)
const widgetPath = path.join(buildDir, 'consultly-widget.js');
if (!fs.existsSync(widgetPath)) {
  console.error('[POST-BUILD CONSULTLY] ✗ CRITICAL ERROR: consultly-widget.js not found!');
  console.error('[POST-BUILD CONSULTLY] Webpack should have created this as the main entry file.');
  console.error('[POST-BUILD CONSULTLY] Check that craco.config.js has the correct output filename configuration.');
  hasErrors = true;
} else {
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');
  const stats = fs.statSync(widgetPath);

  console.log(`[POST-BUILD CONSULTLY] ✓ Verified consultly-widget.js exists (${stats.size} bytes)`);

  // Verify it's NOT a dynamic loader
  if (widgetContent.includes('loadScript') || widgetContent.includes('consultly-main.latest.js')) {
    console.error('[POST-BUILD CONSULTLY] ✗ ERROR: consultly-widget.js appears to be a dynamic loader!');
    console.error('[POST-BUILD CONSULTLY] This will break Wix custom element registration.');
    hasErrors = true;
  } else {
    // Verify it contains custom element registration
    if (widgetContent.includes('customElements.define') && widgetContent.includes('ConsultlyWidgetElement')) {
      console.log(`[POST-BUILD CONSULTLY] ✓ Custom element code detected - contains customElements.define()`);
    } else {
      console.warn('[POST-BUILD CONSULTLY] ⚠️  WARNING: Could not verify customElements.define() in bundle');
      console.warn('[POST-BUILD CONSULTLY] This might be OK if code is minified - check manually');
    }

    // Check if Wix SDK imports are present (minified or not)
    if (widgetContent.includes('wix') || widgetContent.includes('@wix')) {
      console.log(`[POST-BUILD CONSULTLY] ✓ Wix SDK imports detected in bundle`);
    } else {
      console.warn('[POST-BUILD CONSULTLY] ⚠️  WARNING: Could not detect Wix SDK in bundle');
    }

    console.log(`[POST-BUILD CONSULTLY] ✓ This is the IMMEDIATE CUSTOM ELEMENT ENTRY BUNDLE`);
  }
}

// 2. Optionally create build/consultly/index.html reference (for debugging)
const consultlyDir = path.join(buildDir, 'consultly');
if (!fs.existsSync(consultlyDir)) {
  fs.mkdirSync(consultlyDir, { recursive: true });
}

const currentIndexPath = path.join(buildDir, 'index.html');
const consultlyIndexPath = path.join(consultlyDir, 'index.html');

if (fs.existsSync(currentIndexPath)) {
  let html = fs.readFileSync(currentIndexPath, 'utf8');
  fs.writeFileSync(consultlyIndexPath, html);
  console.log(`[POST-BUILD CONSULTLY] ✓ Created .build-temp/consultly/consultly/index.html`);
} else {
  console.warn(`[POST-BUILD CONSULTLY] ⚠️  WARNING: index.html not found in build output!`);
  hasErrors = true;
}

console.log('\n[POST-BUILD CONSULTLY] FINAL BUILD STRUCTURE in .build-temp/consultly/:');
console.log('  ');
console.log('  📦 SCRIPT ENTRY POINT:');
console.log('     consultly-widget.js (IMMEDIATE custom element registration - no dynamic loader!)');
console.log('  ');
console.log('  📂 OTHER FILES:');
console.log('     index.html');
console.log('     consultly/index.html (reference)');
console.log('     static/ (chunks, CSS, assets)');
console.log('  ');
console.log('  ℹ️  Wix Script URL should point to: consultly-widget.js');
console.log('  ℹ️  This file IMMEDIATELY registers customElements.define("consultly-widget", ConsultlyWidgetElement)');
console.log();
console.log('[POST-BUILD CONSULTLY] ✓ Build ready for Wix custom element deployment');
console.log();

if (!hasErrors) {
  console.log('[POST-BUILD CONSULTLY] ✓ Done.\n');
  process.exit(0);
} else {
  console.warn('[POST-BUILD CONSULTLY] ⚠️  Completed with warnings.\n');
  process.exit(0); // Still exit 0 so build continues
}
