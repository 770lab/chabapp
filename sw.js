// Chab'app Service Worker
const CACHE_NAME = 'chabapp-v1';

// Fichiers à mettre en cache au démarrage
const ASSETS_TO_CACHE = [
  '/chabapp/',
  '/chabapp/index.html',
  '/chabapp/manifest.json'
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des fichiers essentiels');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch : stratégie "Network First, Cache Fallback"
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, la mettre en cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Page hors-ligne par défaut pour les navigations
          if (event.request.mode === 'navigate') {
            return caches.match('/chabapp/index.html');
          }
          return new Response('Hors ligne', {
            status: 503,
            statusText: 'Service indisponible'
          });
        });
      })
  );
});
