// sw.js — Service Worker KOULAM v2
// PWA Cache + FCM Push Notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRVG8tGej-3EGI2AXH1Gmpa10GTVA22tk",
  authDomain: "chabapp-5fc3b.firebaseapp.com",
  projectId: "chabapp-5fc3b",
  storageBucket: "chabapp-5fc3b.firebasestorage.app",
  messagingSenderId: "587299342390",
  appId: "1:587299342390:web:278a1c63936d6a14e7b097"
});

var messaging = firebase.messaging();

var KOULAM_URL = self.registration ? self.registration.scope : 'https://770lab.github.io/chabapp/';

// ═══ PWA CACHE ═══
var CACHE_NAME = 'koulam-v8';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png'
];

self.addEventListener('install', function(e) {
  console.log('[SW v2] Installing');
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('[SW v2] Activating');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('workers.dev') !== -1) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      var cl = r.clone();
      caches.open(CACHE_NAME).then(function(c) { c.put(e.request, cl); });
      return r;
    }).catch(function() { return caches.match(e.request); })
  );
});

// ═══ PUSH NOTIFICATIONS — Single handler via push event ═══
self.addEventListener('push', function(event) {
  console.log('[SW v2] Push received');

  var title = 'KOULAM';
  var body = '';
  var url = KOULAM_URL;

  if (event.data) {
    try {
      var raw = event.data.json();
      console.log('[SW v2] Push JSON:', JSON.stringify(raw));
      var d = raw.data || {};
      var n = raw.notification || {};
      title = d.title || n.title || raw.title || title;
      body = d.body || n.body || raw.body || body;
      url = d.url || n.url || raw.url || url;
    } catch(e) {
      try { body = event.data.text(); } catch(e2) {}
    }
  }

  console.log('[SW v2] Showing:', title, '|', body);

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: KOULAM_URL + 'icons/icon-192x192.png',
      badge: KOULAM_URL + 'icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'koulam-' + Date.now(),
      renotify: true,
      data: { url: url },
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

  var url = (event.notification.data && event.notification.data.url) || KOULAM_URL;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('chabapp') !== -1 || list[i].url.indexOf('koulam') !== -1) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
