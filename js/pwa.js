// ============================================================
// SmartDine AI — PWA Service Worker Registration & Install
// ============================================================

/**
 * Register the service worker for offline support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(function (reg) {
        console.log('[PWA] Service Worker registered:', reg.scope);
        reg.update();
      })
      .catch(function (err) {
        console.log('[PWA] Service Worker registration failed:', err);
      });
  }
}

/**
 * Handle the PWA install prompt
 */
var deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('[PWA] Install prompt captured');
});

/**
 * Trigger PWA install (can be called from a button)
 */
function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function (choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        showToast('Installed! 📱', 'SmartDine AI has been installed on your device.', 'success');
      }
      deferredInstallPrompt = null;
    });
  } else {
    showToast('Install', 'Look for the install button in your browser\'s address bar.', 'info');
  }
}
