const CACHE_NAME = 'brew-lab-v1';
const ASSETS = ['index.html', 'mobile_recipes.js', 'brewlab_icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});