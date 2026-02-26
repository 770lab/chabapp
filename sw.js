// sw.js — Service Worker Chab'app
// PWA Cache + Web Push natif (via Cloudflare Worker)

// ═══ PWA CACHE ═══
var CACHE_NAME = 'chabapp-v3';
var ASSETS = [
  '/chabapp/',
  '/chabapp/index.html',
  '/chabapp/manifest.json',
  '/chabapp/icons/icon-192x192.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('workers.dev') !== -1) return; // ne pas cacher les appels au Worker
  e.respondWith(
    fetch(e.request).then(function(r) {
      var cl = r.clone();
      caches.open(CACHE_NAME).then(function(c) { c.put(e.request, cl); });
      return r;
    }).catch(function() { return caches.match(e.request); })
  );
});

// ═══ PUSH NOTIFICATIONS ═══
self.addEventListener('push', function(event) {
  var data = {
    title: "Chab'app",
    body: "Machia'h arrive, soyons prêts !",
    icon: '/chabapp/icons/icon-192x192.png',
    badge: '/chabapp/icons/icon-72x72.png',
    url: '/chabapp/'
  };

  if (event.data) {
    try {
      var payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      if (payload.data && payload.data.url) data.url = payload.data.url;
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [200, 100, 200],
      tag: 'chabapp-notification',
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: 'open', title: '📖 Ouvrir' },
        { action: 'close', title: '✕ Fermer' }
      ]
    })
  );
});

// Clic sur notification → ouvre l'app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  var url = (event.notification.data && event.notification.data.url) || '/chabapp/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('/chabapp/') !== -1) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
