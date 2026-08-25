#!/usr/bin/env node

/**
 * ASSEMBLE BUILD OUTPUTS
 *
 * Merges outputs from isolated .build-temp directories into final build/
 *
 * Structure:
 * .build-temp/public-widget/  → build/
 * .build-temp/consultly/      → build/ (with consultly-widget.js loader)
 * .build-temp/admin/          → build/admin/
 *
 * This ensures all three build targets coexist safely.
 */

const fs = require('fs');
const path = require('path');

const buildTempDir = path.resolve(__dirname, '../.build-temp');
const buildDir = path.resolve(__dirname, '../build');
const publicWidgetSrc = path.join(buildTempDir, 'public-widget');
const consultlySrc = path.join(buildTempDir, 'consultly');
const adminSrc = path.join(buildTempDir, 'admin');

console.log('\n[ASSEMBLE BUILD] Merging isolated build outputs...\n');

// Helper to recursively copy directories
function copyDir(src, dst, options = {}) {
  if (!fs.existsSync(src)) {
    return false;
  }

  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, dstPath, options);
    } else {
      // Skip if destination exists and skipExisting is true
      if (options.skipExisting && fs.existsSync(dstPath)) {
        return;
      }
      fs.copyFileSync(srcPath, dstPath);
    }
  });

  return true;
}

let hasErrors = false;

// 1. Copy public-widget as base (if exists)
if (fs.existsSync(publicWidgetSrc)) {
  if (copyDir(publicWidgetSrc, buildDir)) {
    console.log('[ASSEMBLE BUILD] ✓ Copied public-widget output to build/');
  } else {
    console.warn('[ASSEMBLE BUILD] ⚠️  Could not copy public-widget');
    hasErrors = true;
  }
} else {
  console.log('[ASSEMBLE BUILD] ℹ public-widget build not found (skipping)');
}

// 2. Merge consultly output (should have index.html, static/, consultly-widget.js)
if (fs.existsSync(consultlySrc)) {
  if (copyDir(consultlySrc, buildDir)) {
    console.log('[ASSEMBLE BUILD] ✓ Merged consultly output to build/');
  } else {
    console.warn('[ASSEMBLE BUILD] ⚠️  Could not merge consultly');
    hasErrors = true;
  }
} else {
  console.log('[ASSEMBLE BUILD] ℹ consultly build not found (skipping)');
}

// 3. Copy admin output to build/admin/
if (fs.existsSync(adminSrc)) {
  const adminDstDir = path.join(buildDir, 'admin');
  if (copyDir(adminSrc, adminDstDir)) {
    console.log('[ASSEMBLE BUILD] ✓ Copied admin output to build/admin/');
  } else {
    console.warn('[ASSEMBLE BUILD] ⚠️  Could not copy admin');
    hasErrors = true;
  }
} else {
  console.log('[ASSEMBLE BUILD] ℹ admin build not found (skipping)');
}

// 4. Log final structure
console.log('\n[ASSEMBLE BUILD] Final build structure:');
if (fs.existsSync(path.join(buildDir, 'index.html'))) {
  console.log('  build/index.html                         → Consultly entry point');
}
if (fs.existsSync(path.join(buildDir, 'consultly-widget.js'))) {
  console.log('  build/consultly-widget.js                → Consultly loader (no hash)');
}
if (fs.existsSync(path.join(buildDir, 'static'))) {
  console.log('  build/static/                            → Shared assets');
}
if (fs.existsSync(path.join(buildDir, 'admin/index.html'))) {
  console.log('  build/admin/index.html                   → Admin dashboard');
}
if (fs.existsSync(path.join(buildDir, 'admin/static'))) {
  console.log('  build/admin/static/                      → Admin assets');
}
console.log();

if (!hasErrors) {
  console.log('[ASSEMBLE BUILD] ✓ Done.\n');
  process.exit(0);
} else {
  console.error('[ASSEMBLE BUILD] ✗ Some operations failed.\n');
  process.exit(1);
}
