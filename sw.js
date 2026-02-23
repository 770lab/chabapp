// Chab'app Service Worker
const CACHE_NAME = 'chabapp-v1';

// Files to cache on install (app shell)
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/assets/favicon.png',
  '/assets/apple-touch-icon.png'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin API requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // For API/proxy requests: network only (don't cache dynamic content)
  if (url.hostname.includes('allorigins') || 
      url.hostname.includes('corsproxy') ||
      url.hostname.includes('hebcal') ||
      url.hostname.includes('chabad.org') ||
      url.hostname.includes('nominatim') ||
      url.hostname.includes('timeapi')) {
    return;
  }

  // For app resources: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(event.request);
      })
  );
});
