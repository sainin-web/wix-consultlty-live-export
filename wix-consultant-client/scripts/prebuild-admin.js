#!/usr/bin/env node

/**
 * Pre-build script for admin bundle
 *
 * Before building admin, back up:
 * 1. Public widget's index.html
 * 2. Public widget's static/ directory
 *
 * This prevents the admin build from overwriting public assets.
 * (.buildcache/ is used because build/ gets deleted during react-scripts build)
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const cacheDir = path.resolve(__dirname, '../.buildcache');
const publicIndexPath = path.join(buildDir, 'index.html');
const publicStaticDir = path.join(buildDir, 'static');
const backupIndexPath = path.join(cacheDir, 'public-index.html');
const backupStaticDir = path.join(cacheDir, 'public-static');

// Create cache directory if needed
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Backup public index.html
if (fs.existsSync(publicIndexPath)) {
  fs.copyFileSync(publicIndexPath, backupIndexPath);
  console.log(`[PRE-BUILD ADMIN] ✓ Backed up public index.html`);
} else {
  console.log(`[PRE-BUILD ADMIN] ℹ No index.html to back up`);
}

// Backup public static/ directory
if (fs.existsSync(publicStaticDir)) {
  if (fs.existsSync(backupStaticDir)) {
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
    rimraf(backupStaticDir);
  }

  const copyDir = (src, dst) => {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      const srcPath = path.join(src, file);
      const dstPath = path.join(dst, file);
      if (fs.lstatSync(srcPath).isDirectory()) {
        copyDir(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    });
  };

  copyDir(publicStaticDir, backupStaticDir);
  console.log(`[PRE-BUILD ADMIN] ✓ Backed up public static/ directory\n`);
} else {
  console.log(`[PRE-BUILD ADMIN] ℹ No static/ directory to back up\n`);
}
