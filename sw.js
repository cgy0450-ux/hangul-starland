/* 글자별나라 오프라인 지원: 상대 경로만 캐시하며 외부 통신을 하지 않습니다. */
const CACHE = 'hangul-starland-v4-20261111';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith('hangul-starland-') && key !== CACHE)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then((response) => response).catch(async () => {
      return (await caches.match(req)) || (await caches.match('./index.html'));
    }));
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
