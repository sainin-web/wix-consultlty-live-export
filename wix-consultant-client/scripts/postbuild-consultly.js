#!/usr/bin/env node

/**
 * POST-BUILD SCRIPT FOR CONSULTLY (Isolated Directory)
 *
 * After craco builds with CRACO_BUILD_FOLDER=.build-temp/consultly:
 * 1. Copy consultly-main.*.js to consultly-main.latest.js
 * 2. Create consultly-widget.js loader (fixed entry point, no hash)
 * 3. Copy index.html to consultly/index.html (for reference)
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

// 1. Find and copy latest consultly-main.*.js
if (fs.existsSync(staticDir)) {
  const files = fs.readdirSync(staticDir);
  const mainFile = files.find(f => f.startsWith('consultly-main.') && f.endsWith('.js') && !f.includes('latest'));

  if (mainFile) {
    const srcPath = path.join(staticDir, mainFile);
    const destPath = path.join(staticDir, 'consultly-main.latest.js');

    fs.copyFileSync(srcPath, destPath);
    console.log(`[POST-BUILD CONSULTLY] ✓ Copied ${mainFile} → consultly-main.latest.js`);

    // Also copy sourcemap if exists
    const srcMapFile = mainFile + '.map';
    const srcMapPath = path.join(staticDir, srcMapFile);
    const destMapPath = path.join(staticDir, 'consultly-main.latest.js.map');

    if (fs.existsSync(srcMapPath)) {
      fs.copyFileSync(srcMapPath, destMapPath);
      console.log(`[POST-BUILD CONSULTLY] ✓ Copied ${srcMapFile} → consultly-main.latest.js.map`);
    }
  } else {
    console.warn('[POST-BUILD CONSULTLY] ⚠️  WARNING: No consultly-main.*.js file found!');
    hasErrors = true;
  }
} else {
  console.warn('[POST-BUILD CONSULTLY] ⚠️  static/js directory not found');
  hasErrors = true;
}

// 2. Create consultly-widget.js loader (fixed entry point)
const loaderCode = `/**
 * CONSULTLY WIDGET LOADER - FIXED ENTRY POINT
 * This script NEVER changes (no hash). Always loads the latest build.
 * Every time you run \`npm run build:consultly\`, this automatically
 * loads the latest build without changing this file.
 */

(function() {
  function loadScript() {
    const script = document.createElement('script');
    script.src = window.location.origin + '/static/js/consultly-main.latest.js?t=' + Date.now();
    script.onload = function() {
      console.log('✅ [CONSULTLY LOADER] Latest build loaded successfully');
    };
    script.onerror = function() {
      console.error('❌ [CONSULTLY LOADER] Failed to load consultly-main.latest.js');
    };

    // Try multiple locations to append script
    const targets = [document.body, document.head, document.documentElement];
    for (let target of targets) {
      if (target) {
        target.appendChild(script);
        console.log('[CONSULTLY LOADER] Script appended to', target.tagName || 'documentElement');
        return;
      }
    }
    console.error('[CONSULTLY LOADER] No valid append target found!');
  }

  // Wait for DOM with multiple strategies
  function tryLoad() {
    if (document.body || document.head || document.documentElement) {
      loadScript();
    } else {
      // Retry after a short delay
      setTimeout(tryLoad, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadScript);
  }

  tryLoad();
})();
`;

const loaderPath = path.join(buildDir, 'consultly-widget.js');
fs.writeFileSync(loaderPath, loaderCode);
console.log(`[POST-BUILD CONSULTLY] ✓ Created consultly-widget.js loader`);

// 3. Optionally create build/consultly/index.html reference (for debugging)
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

console.log('\n[POST-BUILD CONSULTLY] Structure in .build-temp/consultly/:');
console.log('  .build-temp/consultly/index.html');
console.log('  .build-temp/consultly/static/');
console.log('  .build-temp/consultly/consultly-widget.js');
console.log('  .build-temp/consultly/consultly/index.html');
console.log();

if (!hasErrors) {
  console.log('[POST-BUILD CONSULTLY] ✓ Done.\n');
  process.exit(0);
} else {
  console.warn('[POST-BUILD CONSULTLY] ⚠️  Completed with warnings.\n');
  process.exit(0); // Still exit 0 so build continues
}
