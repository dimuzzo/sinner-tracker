const CACHE_NAME = 'sinner-tracker-v5';
const DATA_TO_CACHE = [
  '/sinner-tracker/',
  '/sinner-tracker/index.html',
  '/sinner-tracker/style.css',
  '/sinner-tracker/script.js',
  '/sinner-tracker/data.json',
  '/sinner-tracker/manifest.json',
  '/sinner-tracker/assets/icon-192.png',
  '/sinner-tracker/assets/icon-512.png',
  '/sinner-tracker/assets/social-cover.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(DATA_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});