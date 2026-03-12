// sw.js — Service Worker KOULAM
// PWA Cache + FCM Push Notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ═══ Firebase Messaging (background) ═══
firebase.initializeApp({
  apiKey: "AIzaSyBRVG8tGej-3EGI2AXH1Gmpa10GTVA22tk",
  authDomain: "chabapp-5fc3b.firebaseapp.com",
  projectId: "chabapp-5fc3b",
  storageBucket: "chabapp-5fc3b.firebasestorage.app",
  messagingSenderId: "587299342390",
  appId: "1:587299342390:web:278a1c63936d6a14e7b097"
});

var messaging = firebase.messaging();

// Handle background messages from FCM
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message:', payload);
  var data = payload.data || {};
  var notifTitle = data.title || payload.notification?.title || 'KOULAM';
  var notifBody = data.body || payload.notification?.body || '';
  var notifUrl = data.url || self.registration.scope;

  return self.registration.showNotification(notifTitle, {
    body: notifBody,
    icon: self.registration.scope + 'icons/icon-192x192.png',
    badge: self.registration.scope + 'icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'koulam-notification',
    renotify: true,
    data: { url: notifUrl },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  });
});

// ═══ PWA CACHE ═══
var CACHE_NAME = 'koulam-v5';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png'
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
  var base = self.registration.scope;
  var data = {
    title: "KOULAM",
    body: "Machia'h arrive, soyons prêts !",
    icon: base + 'icons/icon-192x192.png',
    badge: base + 'icons/icon-72x72.png',
    url: base
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
      tag: 'koulam-notification',
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'close', title: 'Fermer' }
      ]
    })
  );
});

// Clic sur notification → ouvre l'app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  var url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.registration.scope) !== -1) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
