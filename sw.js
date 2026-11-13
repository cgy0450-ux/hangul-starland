/* 쪼이랜드 오프라인 지원: 상대 경로만 캐시하며 외부 통신을 하지 않습니다. */
const CACHE = 'hangul-starland-v11-6-auto-writing-rescue-20261114';
const CORE = ['./', './index.html', './legacy.html', './journey.html', './parent.html', './curriculum-v10.js', './learning-core-v10.js', './journey-app-v10.js', './joyi-hello.svg', './joyi-hangul.svg', './joyi-math.svg', './joyi-english.svg', './joyi-science.svg', './joyi-history.svg', './joyi-coding.svg', './joyi-finance.svg', './joyi-reading.svg', './joyi-life.svg', './joyi-creativity.svg', './joyi-read.svg', './joyi-write.svg', './joyi-build.svg', './joyi-explore.svg', './joyi-celebrate.svg', './joyi-adventure-world.svg', './joiland-theme-v11.css', './stories.html', './mazes.html', './academy.html', './writing.html', './coding-lab.html', './finance.html', './requests.html', './car-dodge.html', './car-collect.html', './firetruck-rescue.html', './word-gate.js', './adventure.html', './joiland-unified.js', './curated-questions.js', './stories-data.js', './splash-poster.webp?v=6.2', './art-apple.webp?v=6.2', './art-letter-tiger.webp?v=6.2', './manifest.webmanifest?v=10.4', './icon-tiger.svg', './icon-192.png?v=6.0', './icon-512.png?v=6.0'];
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
  // Network-first prevents installed tablets from showing an older cached JS/HTML design.
  // Cached resources remain usable when the tablet is offline.
  event.respondWith(fetch(req).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {}));
    }
    return response;
  }).catch(async () => (await caches.match(req)) || Response.error()));
});
