// sw.js — Chab'app Service Worker
const CACHE_NAME = 'chabapp-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/notifications.js',
  '/manifest.json',
  '/assets/favicon.png',
  '/assets/apple-touch-icon.png',
  '/offline.html'
];

// ─── INSTALL ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Pre-cache partiel:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ─── FETCH — Network first, cache fallback ───
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL))
    )
  );
});

// ─── PUSH NOTIFICATIONS ───
self.addEventListener('push', event => {
  let data = { title: "Chab'app", body: 'Nouvelle notification', icon: '/assets/apple-touch-icon.png' };
  if (event.data) {
    try { data = Object.assign(data, event.data.json()); }
    catch (e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/assets/apple-touch-icon.png',
      badge: '/assets/favicon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'chabapp-notification',
      renotify: true,
      data: { url: data.url || '/index.html', type: data.type || 'general' }
    })
  );
});

// ─── NOTIFICATION CLICK ───
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wc => {
      for (const c of wc) {
        if (c.url.includes(location.origin) && 'focus' in c) { c.navigate(targetUrl); return c.focus(); }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// ─── SCHEDULED NOTIFICATIONS (via message from app) ───
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};
  if (type === 'SCHEDULE_NOTIFICATION') {
    const delay = payload.delay || 0;
    setTimeout(() => {
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/assets/apple-touch-icon.png',
        badge: '/assets/favicon.png',
        vibrate: [200, 100, 200],
        tag: payload.tag || 'scheduled',
        renotify: true,
        data: { url: payload.url || '/index.html', type: payload.type || 'scheduled' }
      });
    }, delay);
  }
  if (type === 'SKIP_WAITING') self.skipWaiting();
});
