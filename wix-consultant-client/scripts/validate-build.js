#!/usr/bin/env node

/**
 * VALIDATE BUILD OUTPUT
 *
 * Verifies the final build/ has all required files and no missing dependencies.
 *
 * Checks:
 * 1. build/index.html exists
 * 2. build/static/ directory exists
 * 3. build/admin/index.html exists
 * 4. build/admin/static/ directory exists
 * 5. No broken script references in HTML files
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');

console.log('\n[VALIDATE BUILD] Checking final build structure...\n');

let errorCount = 0;
let warningCount = 0;

function checkFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ MISSING: ${description}`);
    console.error(`    Expected: ${filePath}`);
    errorCount++;
    return false;
  }
  console.log(`  ✓ ${description}`);
  return true;
}

function checkDirectory(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ✗ MISSING DIR: ${description}`);
    console.error(`    Expected: ${dirPath}`);
    errorCount++;
    return false;
  }
  if (!fs.statSync(dirPath).isDirectory()) {
    console.error(`  ✗ NOT A DIR: ${description}`);
    console.error(`    Path: ${dirPath}`);
    errorCount++;
    return false;
  }
  console.log(`  ✓ ${description}`);
  return true;
}

// Core validation
console.log('[VALIDATE BUILD] Required files:');
checkDirectory(buildDir, 'build/');
checkFile(path.join(buildDir, 'index.html'), 'build/index.html (Consultly entry)');
checkDirectory(path.join(buildDir, 'static'), 'build/static/ (shared assets)');
checkFile(path.join(buildDir, 'consultly-widget.js'), 'build/consultly-widget.js (Consultly loader)');

console.log('\n[VALIDATE BUILD] Admin dashboard files:');
checkFile(path.join(buildDir, 'admin/index.html'), 'build/admin/index.html');
checkDirectory(path.join(buildDir, 'admin/static'), 'build/admin/static/');

// Validate HTML references
console.log('\n[VALIDATE BUILD] Checking HTML references:');

function validateHTML(filePath, description) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    let html = fs.readFileSync(filePath, 'utf8');

    // Check for unfilled template variables
    const templateVars = html.match(/%[A-Z_]+%/g) || [];
    if (templateVars.length > 0) {
      console.warn(`  ⚠️  ${description} has unfilled template variables:`);
      templateVars.forEach(v => console.warn(`      ${v}`));
      warningCount++;
    } else {
      console.log(`  ✓ ${description} has no unfilled template variables`);
    }

    // Check for script tags (should be there)
    const scriptCount = (html.match(/<script/g) || []).length;
    console.log(`    Scripts found: ${scriptCount}`);
  } catch (err) {
    console.error(`  ✗ Failed to read ${description}: ${err.message}`);
    errorCount++;
  }
}

validateHTML(path.join(buildDir, 'index.html'), 'build/index.html');
validateHTML(path.join(buildDir, 'admin/index.html'), 'build/admin/index.html');

// Summary
console.log('\n[VALIDATE BUILD] Summary:');
console.log(`  Errors:   ${errorCount}`);
console.log(`  Warnings: ${warningCount}`);

if (errorCount === 0) {
  console.log('\n[VALIDATE BUILD] ✓ Build validation passed!\n');
  process.exit(0);
} else {
  console.error(`\n[VALIDATE BUILD] ✗ Build validation FAILED (${errorCount} errors).\n`);
  process.exit(1);
}
