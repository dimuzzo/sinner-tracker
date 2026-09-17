const CACHE_NAME = 'sinner-tracker-v9';
const RUNTIME_CACHE = 'sinner-tracker-runtime-v9';
const APP_SHELL = [
  './', './index.html', './style.css', './script.js', './data.json', './manifest.json',
  './assets/icon-192.png', './assets/icon-512.png', './assets/social-cover.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => ![CACHE_NAME, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const url = new URL(event.request.url);
    const isData = isSameOrigin(event.request) && url.pathname.endsWith('/data.json');

    try {
      const response = await fetch(event.request);
      if (response && (response.ok || response.type === 'opaque') && event.request.url.startsWith('http')) {
        const cache = await caches.open(RUNTIME_CACHE);
        const cleanRequest = isData ? new Request(url.pathname) : event.request;
        cache.put(cleanRequest, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cache = await caches.open(RUNTIME_CACHE);
      if (isData) {
        const cachedData = await cache.match(new Request(url.pathname));
        if (cachedData) return cachedData;
      }
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const fallback = await caches.match('./index.html');
      if (fallback && event.request.mode === 'navigate') return fallback;
      throw error;
    }
  })());
});