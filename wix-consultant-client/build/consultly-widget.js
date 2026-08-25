/**
 * CONSULTLY WIDGET LOADER - FIXED ENTRY POINT
 * This script NEVER changes (no hash). Always loads the latest build.
 * Every time you run `npm run build:consultly`, this automatically
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
