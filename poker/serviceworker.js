// sw.js
const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/poker/pokerclock.html',
    '/poker/pokerclockapp.js',
    '/poker/styles.css',
    '/poker/speak.js',
    '/poker/pokersounds.js',
    '/poker/samplestructures.js',
    '/poker/colorutils.js',
    '/poker/serviceworker.js',
  
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});