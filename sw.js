// sw.js — Brew Lab Service Worker
// Strategy:
//   mobile_recipes.js → network-first (always fetch fresh when online,
//                        fall back to cache when offline/garage mode)
//   everything else   → cache-first  (fast, stable; only re-fetched when
//                        CACHE_NAME changes, i.e. when you redeploy static assets)
//
// CACHE_NAME only needs to be bumped when you change static files (HTML, icons,
// manifest). It does NOT need to change on every recipe export — mobile_recipes.js
// is handled separately by the network-first strategy above.

const CACHE_NAME = 'brew-lab-v5';

const STATIC_ASSETS = [
    'index.html',
    'brewlab_timer.html',
    'brewlab_icon.png',
    'brewlab_flavicon.png',
    'manifest.json',
];

// ── Install: pre-cache static assets ──────────────────────────────────────────
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ── Activate: delete any old caches ───────────────────────────────────────────
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: split strategy ─────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Network-first for the recipe data file — strip any ?v= query params
    // when matching so versioned and un-versioned requests both hit this path.
    if (url.pathname.endsWith('mobile_recipes.js')) {
        e.respondWith(
            fetch(e.request)
                .then((networkRes) => {
                    // Store a fresh copy in cache for offline use
                    const clone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, clone);
                    });
                    return networkRes;
                })
                .catch(() => {
                    // Offline fallback — serve cached copy
                    return caches.match(e.request);
                })
        );
        return;
    }

    // Cache-first for everything else (HTML, icons, manifest)
    e.respondWith(
        caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
});
