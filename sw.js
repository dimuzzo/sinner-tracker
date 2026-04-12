const CACHE_NAME = 'sinner-tracker-v2';
const urlsToCache = [
  '/sinner-tracker/',
  '/sinner-tracker/index.html',
  '/sinner-tracker/style.css',
  '/sinner-tracker/script.js'
];

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache hit or fetch from network
        return response || fetch(event.request);
      })
  );
});