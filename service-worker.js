const CACHE_NAME = 'interbank-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/htmls/index.html',
  '/htmls/signin.html',
  '/htmls/createAccount.html',
  '/htmls/extrato.html',
  '/htmls/adicionar_transacao.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple network-first for API calls, cache-first for static
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});