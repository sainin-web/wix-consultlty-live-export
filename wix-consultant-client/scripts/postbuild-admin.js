#!/usr/bin/env node

/**
 * Post-build script for admin bundle
 *
 * After craco builds the admin dashboard to build/, this script:
 * 1. The admin build overwrote build/index.html (because both go to same dir)
 * 2. We need to preserve the public widget index.html and move admin to admin/
 * 3. We use the backed-up public index.html or rebuild from template
 *
 * Result:
 * - Public widget: build/index.html (with PUBLIC_URL=/ asset paths)
 * - Admin dashboard: build/admin/index.html (with PUBLIC_URL=/admin/ asset paths)
 * - Shared assets: build/static/
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const cacheDir = path.resolve(__dirname, '../.buildcache');
const adminDir = path.resolve(buildDir, 'admin');
const currentIndexPath = path.join(buildDir, 'index.html');
const currentStaticDir = path.join(buildDir, 'static');
const publicBackupPath = path.join(cacheDir, 'public-index.html');

console.log('\n[POST-BUILD ADMIN] Organizing build output...\n');

// Create admin directory if it doesn't exist
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
  console.log(`[POST-BUILD ADMIN] ✓ Created ${adminDir}`);
}

// The current index.html is the admin version (from this build)
// Save it to admin/index.html
if (fs.existsSync(currentIndexPath)) {
  const destIndex = path.join(adminDir, 'index.html');

  let html = fs.readFileSync(currentIndexPath, 'utf8');

  html = html.replace(/%PUBLIC_URL%/g, '/admin');

  fs.writeFileSync(destIndex, html);

  console.log(
    `[POST-BUILD ADMIN] ✓ Saved admin index to admin/index.html with /admin asset paths`
  );
}
// Copy static directory to admin/static/ for the /admin/static/ paths in HTML
const adminStaticDir = path.join(adminDir, 'static');
if (!fs.existsSync(adminStaticDir) && fs.existsSync(currentStaticDir)) {
  copyDirRecursive(currentStaticDir, adminStaticDir);
  console.log(`[POST-BUILD ADMIN] ✓ Copied static assets to admin/static/`);
}

// Helper to copy directory recursively
function copyDirRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  });
}

// Restore the public widget index.html from backup if it exists
const publicStaticBackupDir = path.join(cacheDir, 'public-static');
if (fs.existsSync(publicBackupPath)) {
  fs.copyFileSync(publicBackupPath, currentIndexPath);
  console.log(`[POST-BUILD ADMIN] ✓ Restored public widget index.html from backup`);
} else {
  console.warn(`[POST-BUILD ADMIN] ⚠️  WARNING: Public index.html backup not found!`);
}

// Restore the public widget static/ directory from backup
if (fs.existsSync(publicStaticBackupDir)) {
  // Remove admin's static (which has admin files)
  if (fs.existsSync(currentStaticDir)) {
    const rimraf = (dir) => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const fullPath = path.join(dir, file);
          if (fs.lstatSync(fullPath).isDirectory()) {
            rimraf(fullPath);
          } else {
            fs.unlinkSync(fullPath);
          }
        });
        fs.rmdirSync(dir);
      }
    };
    rimraf(currentStaticDir);
  }

  // Copy public static back
  copyDirRecursive(publicStaticBackupDir, currentStaticDir);
  console.log(`[POST-BUILD ADMIN] ✓ Restored public static/ directory to build/static/`);
} else {
  console.warn(`[POST-BUILD ADMIN] ⚠️  WARNING: Public static/ backup not found!`);
}

console.log(`\n[POST-BUILD ADMIN] ✓ Build structure:`);
console.log(`  └── build/`);
console.log(`      ├── index.html (public widget with PUBLIC_URL=/)`);
console.log(`      ├── static/ (shared CSS/JS)`);
console.log(`      └── admin/`);
console.log(`          └── index.html (admin dashboard with PUBLIC_URL=/admin/)\n`);

console.log('[POST-BUILD ADMIN] ✓ Done.\n');
