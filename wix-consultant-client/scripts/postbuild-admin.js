#!/usr/bin/env node

/**
 * POST-BUILD SCRIPT FOR ADMIN (Isolated Directory)
 *
 * After craco builds with CRACO_BUILD_FOLDER=.build-temp/admin:
 * 1. Verify admin build output exists in .build-temp/admin/
 * 2. Organize structure for later merging
 *
 * The assemble-build.js script will later copy this to final build/admin/
 *
 * NO backups or restores needed - each build target is isolated!
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../.build-temp/admin');
const staticDir = path.join(buildDir, 'static');
const indexPath = path.join(buildDir, 'index.html');

console.log('\n[POST-BUILD ADMIN] Processing build output in .build-temp/admin/...\n');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('[POST-BUILD ADMIN] ✗ ERROR: Build directory not found:', buildDir);
  process.exit(1);
}

let hasErrors = false;

// 1. Verify index.html exists
if (fs.existsSync(indexPath)) {
  console.log('[POST-BUILD ADMIN] ✓ Found index.html');

  // Fix %PUBLIC_URL% references if needed
  let html = fs.readFileSync(indexPath, 'utf8');
  if (html.includes('%PUBLIC_URL%')) {
    // Keep %PUBLIC_URL% as /admin since PUBLIC_URL=/admin/ is set in build script
    // The references will be /admin/static/ which is correct
    console.log('[POST-BUILD ADMIN] ℹ HTML has %PUBLIC_URL% references (expected for /admin/ paths)');
  }
} else {
  console.error('[POST-BUILD ADMIN] ✗ ERROR: index.html not found!');
  hasErrors = true;
}

// 2. Verify static directory exists
if (fs.existsSync(staticDir)) {
  const staticFiles = fs.readdirSync(staticDir);
  console.log(`[POST-BUILD ADMIN] ✓ Found static/ directory (${staticFiles.length} files/dirs)`);

  // List subdirectories
  staticFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    const isDir = fs.statSync(filePath).isDirectory();
    if (isDir) {
      const subFiles = fs.readdirSync(filePath);
      console.log(`  - ${file}/ (${subFiles.length} files)`);
    }
  });
} else {
  console.warn('[POST-BUILD ADMIN] ⚠️  WARNING: static/ directory not found!');
  hasErrors = true;
}

console.log('\n[POST-BUILD ADMIN] Structure in .build-temp/admin/:');
console.log('  .build-temp/admin/index.html');
console.log('  .build-temp/admin/static/');
console.log('  .build-temp/admin/favicon.ico');
console.log('  ... (other assets)');
console.log();

console.log('[POST-BUILD ADMIN] Note:');
console.log('  - NO backup/restore needed - this directory is isolated');
console.log('  - assemble-build.js will copy this to final build/admin/');
console.log();

if (!hasErrors) {
  console.log('[POST-BUILD ADMIN] ✓ Done.\n');
  process.exit(0);
} else {
  console.error('[POST-BUILD ADMIN] ✗ Build validation failed!\n');
  process.exit(1);
}
