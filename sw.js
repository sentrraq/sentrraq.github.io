'use strict';
var CACHE = 'sentraq-v1';
var ASSETS = ['/', '/index.html', '/assets/css/style.css', '/assets/js/script.js', '/products.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase') || e.request.url.includes('cdn.jsdelivr')) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fresh = fetch(e.request).then(function (res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fresh;
    })
  );
});
