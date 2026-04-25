const CACHE = 'lgt-v2';
const ASSETS = [
  '/gym-app/', '/gym-app/index.html',
  '/gym-app/css/app.css',
  '/gym-app/js/data.js', '/gym-app/js/db.js', '/gym-app/js/app.js',
  '/gym-app/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  )
);

self.addEventListener('fetch', e => {
  // Network-first for CDN (Chart.js), cache-first for local assets
  if (e.request.url.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
