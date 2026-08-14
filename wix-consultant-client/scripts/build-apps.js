#!/usr/bin/env node

/**
 * Build script for separate app bundles
 *
 * Builds each app independently:
 * - Storefront
 * - Consultant Portal
 * - Customer Portal
 *
 * Each app builds to its own public/build directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apps = ['storefront', 'consultant', 'customer'];
const appSrcDir = path.join(__dirname, '../src/apps');
const buildDir = path.join(__dirname, '../build');

console.log('🏗️  Building separate app bundles...\n');

apps.forEach((app) => {
  console.log(`📦 Building ${app}...`);

  const appPath = path.join(appSrcDir, app);
  const appBuildDir = path.join(buildDir, app);

  if (!fs.existsSync(appPath)) {
    console.error(`❌ App not found: ${appPath}`);
    process.exit(1);
  }

  // Set environment variables for this specific app
  process.env.REACT_APP_BUILD_TARGET = app;
  process.env.PUBLIC_URL = `/${app}`;

  try {
    // Build the app using react-scripts
    execSync(`REACT_APP_BUILD_TARGET=${app} PUBLIC_URL=/${app} react-scripts build`, {
      cwd: path.dirname(appPath),
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log(`✅ ${app} built successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to build ${app}:`, error.message);
    process.exit(1);
  }
});

console.log('✅ All apps built successfully!');
console.log('\n📂 Build output:');
apps.forEach((app) => {
  console.log(`   ${app}: ./build/${app}`);
});
