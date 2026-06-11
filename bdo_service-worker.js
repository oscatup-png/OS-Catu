// ── Service Worker — Perbras BDO ──────────────────────────────
// Incrementar a versão ao atualizar o HTML para forçar novo cache
const CACHE = 'perbras-bdo-v1';

const FILES = [
  './boletim_geral_OS_Catu_4.html',
  './bdo_manifest.json',
  './bdo_icon-192.png',
  './bdo_icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => new Response('Sem conexão. Abra quando conectado.', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }));
    })
  );
});
