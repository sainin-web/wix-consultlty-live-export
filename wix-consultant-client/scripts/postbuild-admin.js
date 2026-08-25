#!/usr/bin/env node

/**
 * Post-build script for admin bundle
 *
 * After admin build completes:
 * 1. Current build/index.html is the admin version
 * 2. Copy it to build/admin/index.html
 * 3. Copy build/static/ to build/admin/static/ (for admin asset paths)
 * 4. Restore build/index.html from backed-up public version
 * 5. Restore build/static/ from backed-up public version (CRITICAL FIX)
 *
 * This ensures both public widget and admin coexist properly:
 * - build/index.html + build/static/ = Public widget (consultly)
 * - build/admin/index.html + build/admin/static/ = Admin dashboard
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const cacheDir = path.resolve(__dirname, '../.buildcache');
const adminDir = path.resolve(buildDir, 'admin');
const currentIndexPath = path.join(buildDir, 'index.html');
const publicBackupPath = path.join(cacheDir, 'public-index.html');
const publicStaticBackupDir = path.join(cacheDir, 'public-static');

console.log('\n[POST-BUILD ADMIN] Processing build output...\n');

// 1. Create admin directory
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
  console.log(`[POST-BUILD ADMIN] ✓ Created ${adminDir}`);
}

// 2. Save current index.html (admin version) to admin/index.html
if (fs.existsSync(currentIndexPath)) {
  const destIndex = path.join(adminDir, 'index.html');
  let html = fs.readFileSync(currentIndexPath, 'utf8');
  html = html.replace(/%PUBLIC_URL%/g, '/admin');
  fs.writeFileSync(destIndex, html);
  console.log(`[POST-BUILD ADMIN] ✓ Saved admin dashboard to admin/index.html`);
}

// 3. Copy admin static to admin/static (same structure)
const currentStaticDir = path.join(buildDir, 'static');
const adminStaticDir = path.join(adminDir, 'static');

if (fs.existsSync(currentStaticDir)) {
  const copyDir = (src, dst) => {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      const srcPath = path.join(src, file);
      const dstPath = path.join(dst, file);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, dstPath);
      } else if (!fs.existsSync(dstPath)) {
        fs.copyFileSync(srcPath, dstPath);
      }
    });
  };

  copyDir(currentStaticDir, adminStaticDir);
  console.log(`[POST-BUILD ADMIN] ✓ Copied static to admin/static/`);
}

// 4. Restore public widget index.html from backup
if (fs.existsSync(publicBackupPath)) {
  fs.copyFileSync(publicBackupPath, currentIndexPath);
  console.log(`[POST-BUILD ADMIN] ✓ Restored public widget index.html`);
} else {
  console.warn(`[POST-BUILD ADMIN] ⚠️  WARNING: Public backup not found!`);
}

// 5. Restore public widget static/ directory from backup
if (fs.existsSync(publicStaticBackupDir)) {
  // Delete current admin static files
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

  if (fs.existsSync(currentStaticDir)) {
    rimraf(currentStaticDir);
  }

  // Restore from backup
  const copyDir = (src, dst) => {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      const srcPath = path.join(src, file);
      const dstPath = path.join(dst, file);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    });
  };

  copyDir(publicStaticBackupDir, currentStaticDir);
  console.log(`[POST-BUILD ADMIN] ✓ Restored public widget static/ directory`);
} else {
  console.warn(`[POST-BUILD ADMIN] ⚠️  WARNING: Public static backup not found!`);
}

console.log(`\n[POST-BUILD ADMIN] ✓ Done.\n`);
console.log(`[POST-BUILD ADMIN] Final structure:`);
console.log(`  build/index.html                 → Public widget (consultly)`);
console.log(`  build/static/                    → Shared CSS/JS (consultly + public)`);
console.log(`  build/admin/index.html           → Admin dashboard`);
console.log(`  build/admin/static/              → Admin assets\n`);
