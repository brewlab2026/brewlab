const CACHE_NAME = 'brew-lab-v1774582621';
const ASSETS = ['index.html', 'mobile_recipes.js', 'brewlab_icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

// Force the new service worker to become active immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. If we have it in the suitcase, return it
      if (response) {
        return response;
      }
      // 2. If not, go to GitHub to get it
      return fetch(event.request);
    })
  );
});