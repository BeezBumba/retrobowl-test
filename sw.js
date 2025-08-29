const KEY = 'RETROBOWL';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(KEY)
                .then((cache) => {
                    return cache.addAll(event.data.payload);
                })
        );
    }
});


const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.mp3', '.wav', '.json', '.js'];

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    e.respondWith(
      caches.open(KEY).then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;

        const resp = await fetch(e.request);
        if (resp.ok) {
          cache.put(e.request, resp.clone());
        }
        return resp;
      })
    );
  }
});
