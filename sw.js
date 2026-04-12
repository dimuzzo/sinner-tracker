const CACHE_NAME = 'sinner-tracker-v3';
const urlsToCache = [
  '/sinner-tracker/',
  '/sinner-tracker/index.html',
  '/sinner-tracker/style.css',
  '/sinner-tracker/script.js',
  '/sinner-tracker/social-cover.jpg'
];

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});