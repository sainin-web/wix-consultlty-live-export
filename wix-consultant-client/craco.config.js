/**
 * CRACO Configuration for Multiple Entry Points
 *
 * Allows building separate bundles for:
 * 1. Public Widget (npm run build:public-widget)
 * 2. Admin Dashboard (npm run build:admin)
 *
 * CRACO Override: https://github.com/dilanx/craco
 *
 * Installation: npm install @craco/craco --save-dev
 * Update package.json scripts to use "craco" instead of "react-scripts"
 */

const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const buildTarget = process.env.REACT_APP_BUILD_TARGET || 'public-widget';

      console.log(`\n[CRACO CONFIG] Building for: ${buildTarget}\n`);

      // Determine the correct entry point based on build target
      if (buildTarget === 'admin') {
        webpackConfig.entry = path.resolve(__dirname, 'src/admin-index.js');
        console.log(`[CRACO CONFIG] Entry point: src/admin-index.js`);
      } else if (buildTarget === 'consultly') {
        webpackConfig.entry = path.resolve(__dirname, 'src/consultly-widget.js');
        console.log(`[CRACO CONFIG] Entry point: src/consultly-widget.js`);
      } else if (buildTarget === 'public-widget') {
        webpackConfig.entry = path.resolve(__dirname, 'src/index.js');
        console.log(`[CRACO CONFIG] Entry point: src/index.js`);
      } else {
        // Default to public widget
        webpackConfig.entry = path.resolve(__dirname, 'src/index.js');
        console.log(`[CRACO CONFIG] Entry point (default): src/index.js`);
      }

      // Set different output filenames based on build target
      if (buildTarget === 'admin') {
        webpackConfig.output.filename = 'static/js/admin-[name].[contenthash:8].js';
        webpackConfig.output.chunkFilename = 'static/js/admin-[name].[contenthash:8].chunk.js';

        // Use admin HTML template
        webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
          if (plugin.constructor.name === 'HtmlWebpackPlugin') {
            plugin.options.template = path.resolve(__dirname, 'public/admin/index.html');
            console.log(`[CRACO CONFIG] HTML template: public/admin/index.html`);
          }
          return plugin;
        });
      } else if (buildTarget === 'consultly') {
        webpackConfig.output.filename = 'static/js/consultly-[name].[contenthash:8].js';
        webpackConfig.output.chunkFilename = 'static/js/consultly-[name].[contenthash:8].chunk.js';

        // Use consultly HTML template
        webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
          if (plugin.constructor.name === 'HtmlWebpackPlugin') {
            plugin.options.template = path.resolve(__dirname, 'public/consultly/index.html');
            console.log(`[CRACO CONFIG] HTML template: public/consultly/index.html`);
          }
          return plugin;
        });
      }

      return webpackConfig;
    },
  },
};
