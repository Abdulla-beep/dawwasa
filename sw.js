// دوّاسة service worker: يفتح التطبيق بدون إنترنت ويحفظ الخرايط والصور اللي شفتها.
const VERSION = 'dawwasa-v1';
const SHELL = [
  './', './index.html', './css/app.css', './js/app.js', './js/core.js', './js/ride.js', './js/data.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
];
const TILE_CACHE = 'dawwasa-tiles';
const IMG_CACHE = 'dawwasa-photos';
const MAX_TILES = 2500;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== TILE_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trimTiles() {
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  if (keys.length > MAX_TILES) await Promise.all(keys.slice(0, keys.length - MAX_TILES).map((k) => c.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // map tiles: cache first, keep what the user has viewed for offline use
  if (/tile\.openstreetmap\.org|tile\.opentopomap\.org/.test(url.hostname)) {
    e.respondWith(caches.open(TILE_CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trimTiles(); }
        return res;
      } catch { return new Response('', { status: 504 }); }
    }));
    return;
  }

  // trail photos from Wikimedia: cache first so they show offline
  if (/(^|\.)wikimedia\.org$/.test(url.hostname)) {
    e.respondWith(caches.open(IMG_CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }
      catch { return new Response('', { status: 504 }); }
    }));
    return;
  }

  // weather: network first, fall back to cache
  if (url.hostname === 'api.open-meteo.com') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }

  // app shell + fonts + leaflet: stale-while-revalidate
  if (url.origin === location.origin || /unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: url.origin === location.origin });
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || (req.mode === 'navigate' ? c.match('./index.html') : new Response('', { status: 504 }));
    }));
  }
});
