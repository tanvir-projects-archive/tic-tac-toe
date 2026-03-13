const CACHE_NAME = 'tictactoe-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/style.css',
  './src/script.js',
  './src/img/favicon.png',
  './src/img/icon.png',
  './src/vid/background.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
