// sw.js — Service Worker pour Chab'app
// À placer à la RACINE de /chabapp/

const CACHE_NAME = 'chabapp-v1';
const ASSETS_TO_CACHE = [
  '/chabapp/',
  '/chabapp/index.html',
  '/chabapp/manifest.json',
  '/chabapp/icons/icon-192x192.png',
  '/chabapp/icons/icon-512x512.png'
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch : stratégie Network First, fallback sur cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  let data = {
    title: "Chab'app",
    body: "Machia'h arrive, soyons prêt !",
    icon: '/chabapp/icons/icon-192x192.png',
    badge: '/chabapp/icons/icon-72x72.png',
    url: '/chabapp/'
  };

  // Si le push contient des données JSON
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: 'chabapp-notification',
    renotify: true,
    data: { url: data.url || '/chabapp/' },
    actions: [
      { action: 'open', title: '📖 Ouvrir' },
      { action: 'close', title: '✕ Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur la notification → ouvre l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/chabapp/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si l'app est déjà ouverte, on la focus
      for (const client of clientList) {
        if (client.url.includes('/chabapp/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon on ouvre un nouvel onglet
      return clients.openWindow(urlToOpen);
    })
  );
});
