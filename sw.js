const CACHE_NAME = 'brew-lab-v1774582344';
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


// Update this section in your sw.js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ANY old suitcases that aren't the current one
          if (cacheName !== CACHE_NAME) {
            console.log('--- Clearing Old Brew Cache ---');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of the page immediately
  );
});