var CACHE_NAME = 'smartdine-v31';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/themes.css',
  '/css/animations.css',
  '/css/style.css',
  '/css/responsive.css',
  '/js/utils.js',
  '/js/storage.js',
  '/js/config.js',
  '/js/api.js',
  '/js/data.js',
  '/js/auth.js',
  '/js/router.js',
  '/js/customer.js',
  '/js/cart.js',
  '/js/kitchen.js',
  '/js/admin.js',
  '/js/inventory.js',
  '/js/analytics.js',
  '/js/ai.js',
  '/js/pwa.js',
  '/js/app.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/index.html');
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
