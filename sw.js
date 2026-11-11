/* 쪼이랜드 오프라인 지원: 상대 경로만 캐시하며 외부 통신을 하지 않습니다. */
const CACHE = 'hangul-starland-v6-3-card-art-20261111';
const CORE = ['./', './index.html', './splash-poster.webp?v=6.2', './art-apple.webp?v=6.2', './art-letter-tiger.webp?v=6.2', './manifest.webmanifest?v=6.2', './icon-tiger.svg', './icon-192.png?v=6.0', './icon-512.png?v=6.0'];
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
