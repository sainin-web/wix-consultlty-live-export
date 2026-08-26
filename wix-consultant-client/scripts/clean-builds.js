#!/usr/bin/env node

/**
 * CLEAN BUILD DIRECTORIES
 *
 * Removes:
 * - .build-temp/ (temporary isolated build outputs)
 * - build/ (final assembled output)
 *
 * This ensures a clean slate for a full build:all run
 */

const fs = require('fs');
const path = require('path');

const buildTempDir = path.resolve(__dirname, '../.build-temp');
const buildDir = path.resolve(__dirname, '../build');

function removeDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return true;
  }

  try {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        removeDirectory(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    });
    fs.rmdirSync(dir);
    return true;
  } catch (err) {
    console.error(`Failed to remove ${dir}:`, err.message);
    return false;
  }
}

console.log('\n[CLEAN BUILDS] Removing temporary and build directories...\n');

let success = true;

if (fs.existsSync(buildTempDir)) {
  if (removeDirectory(buildTempDir)) {
    console.log('[CLEAN BUILDS] ✓ Removed .build-temp/');
  } else {
    console.warn('[CLEAN BUILDS] ⚠️  Failed to remove .build-temp/');
    success = false;
  }
}

if (fs.existsSync(buildDir)) {
  if (removeDirectory(buildDir)) {
    console.log('[CLEAN BUILDS] ✓ Removed build/');
  } else {
    console.warn('[CLEAN BUILDS] ⚠️  Failed to remove build/');
    success = false;
  }
}

if (success) {
  console.log('[CLEAN BUILDS] ✓ Done.\n');
  process.exit(0);
} else {
  console.warn('[CLEAN BUILDS] ⚠️  Some directories could not be removed. Proceeding anyway...\n');
  // Don't fail the entire build if directories are locked
  // Craco will handle overwriting when it builds
  process.exit(0);
}
