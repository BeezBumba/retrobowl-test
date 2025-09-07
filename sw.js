const CACHE_NAME = 'RETROBOWL-v1';
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-cache'; // New cache for dynamic resources

const RAW_ASSETS = [
  'index.html',
  'register_sw.js',
  'manifest.json',
  'sdk/poki-sdk.js',
  'favicon.ico',
  'rb192.jpg',
  'img/icon.jpg',
  'img/splash.png',
  'js/main.js',
  'js/main_unpacked.js',
  'sdk/details.json',
  'sdk/prebid.js',
  'sdk/settings.json',
  'sdk/core.js/poki-sdk-core-.js',
  'rb400.jpg',
  'rb64.jpg',
  'cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js',
  'html5game/sound/worklets/audio-worklet.js',
  'html5game/Achievements.txt',
  'html5game/Charities.txt',
  'html5game/Colleges.txt',
  'html5game/LanguageUS.txt',
  'html5game/LanguageUS_FR.txt',
  'html5game/Names_F0.txt',
  'html5game/Names_F1.txt',
  'html5game/Names_L.txt',
  'html5game/PlayerRecords.txt',
  'html5game/RetroBowl.js',
  'html5game/RetroBowlHOF.txt',
  'html5game/RetroBowl_History.txt',
  'html5game/RetroBowl_texture_0.png',
  'html5game/RetroBowl_texture_1.png',
  'html5game/RetroBowl_texture_2.png',
  'html5game/RetroBowl_texture_3.png',
  'html5game/Schedule17.txt',
  'html5game/Shopping.txt',
  'html5game/Teams.txt',
  'html5game/code.css',
  'html5game/code.txt',
  'html5game/snd_audible.ogg',
  'html5game/snd_audience_dis.ogg',
  'html5game/snd_audience_fg.ogg',
  'html5game/snd_audience_idle.ogg',
  'html5game/snd_beep.ogg',
  'html5game/snd_beep2.ogg',
  'html5game/snd_bounce.ogg',
  'html5game/snd_click.ogg',
  'html5game/snd_drink.ogg',
  'html5game/snd_error.ogg',
  'html5game/snd_kick.ogg',
  'html5game/snd_music.ogg',
  'html5game/snd_oof1.ogg',
  'html5game/snd_oof2.ogg',
  'html5game/snd_oof3.ogg',
  'html5game/snd_post.ogg',
  'html5game/snd_purchase.ogg',
  'html5game/snd_starrating.ogg',
  'html5game/snd_success.ogg',
  'html5game/snd_tackle.ogg',
  'html5game/snd_throw.ogg',
  'html5game/snd_timeout.ogg',
  'html5game/splash.png',
  'html5game/uniforms_default.txt',
  'html5game/uph_poki.js'
];

function assetURL(asset) {
  return new URL(asset, self.location.origin).href;
}

// Install: cache all assets, log failures and verify after
self.addEventListener('install', event => {
  console.log('[SW] 🔧 Install event triggered');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log(`[SW] 📦 Opened cache: ${CACHE_NAME}`);
      const failedAssets = [];
      for (const asset of RAW_ASSETS) {
        try {
          await cache.add(asset);
          console.log(`[SW] ✅ Cached: ${assetURL(asset)}`);
        } catch (err) {
          failedAssets.push(asset);
          // Only log if online to avoid spam when offline
          if (navigator.onLine) {
            console.error(`[SW] ❌ Failed to cache: ${assetURL(asset)}`, err);
          }
        }
      }
      if (failedAssets.length) {
        console.warn('[SW] ⚠️ Assets that failed to cache:', failedAssets);
      }

      // Post-install: check for missing assets in cache
      const cachedRequests = await cache.keys();
      const cachedURLs = cachedRequests.map(req => req.url);
      const missingAssets = RAW_ASSETS.filter(asset => {
        return !cachedURLs.includes(assetURL(asset));
      });
      if (missingAssets.length) {
        console.warn('[SW] 🕵️ Assets declared but not found in cache after install:', missingAssets);
      } else {
        console.log('[SW] 🎉 All declared assets present in cache after install.');
      }
    }).catch(err => {
      console.error('[SW] 🚨 Cache open failed:', err);
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE_NAME).map(key => { // Also clean up new runtime cache
          console.log(`[SW] 🗑 Deleting old cache: ${key}`);
          return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignore analytics / Cloudflare RUM / ad beacons
  if (
    url.pathname.startsWith('/cdn-cgi/rum') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('cmp.inmobi.com')
  ) {
    console.log(`[SW] 🚫 Blocking analytics/tracking request: ${url.href}`);
    event.respondWith(new Response(undefined, { status: 204 }));
    return;
  }

  // Handle HEAD requests for cached assets (GameMaker file_exists)
  if (event.request.method === 'HEAD') {
    event.respondWith((async () => {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) {
        console.log(`[SW] 💡 Serving HEAD from cache: ${url.href}`);
        return new Response('', { status: 200, headers: cached.headers });
      }
      try {
        console.log(`[SW] 📡 Fetching HEAD from network: ${url.href}`);
        return await fetch(event.request);
      } catch {
        console.warn(`[SW] ❌ HEAD fetch failed: ${url.href}`);
        return new Response('', { status: 404 });
      }
    })());
    return;
  }

  // Strategy: Cache-First, then Network, then Runtime Cache, then Fallback
  event.respondWith(
    (async () => {
      // 1. Try to serve from RAW_ASSETS cache first
      let cachedResponse = await caches.match(event.request, { ignoreSearch: true });
      if (cachedResponse) {
        console.log(`[SW] ✅ Serving from static cache: ${url.href}`);
        return cachedResponse;
      }

      // 2. If not in static cache, try to serve from runtime cache
      cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        console.log(`[SW] ✅ Serving from runtime cache: ${url.href}`);
        return cachedResponse;
      }

      // 3. If not in any cache, go to network
      console.log(`[SW] 🌐 Fetching from network: ${url.href}`);
      try {
        const networkResponse = await fetch(event.request);

        // Check if the response is valid and cacheable (e.g., successful GET request)
        if (networkResponse.ok && event.request.method === 'GET' && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
            console.log(`[SW] ✨ Dynamically cached: ${url.href}`);
          }).catch(err => {
            console.error(`[SW] ⚠️ Failed to dynamically cache ${url.href}:`, err);
          });
        }
        return networkResponse;
      } catch (error) {
        console.error(`[SW] ❌ Network fetch failed for ${url.href}:`, error);

        // 4. Fallback logic if network fails
        if (event.request.mode === 'navigate') {
          console.log(`[SW] ↩️ Serving index.html fallback for navigation: ${url.href}`);
          return caches.match('index.html');
        }
        if (url.pathname.endsWith('.json')) {
          console.log(`[SW] ↩️ Serving empty JSON fallback: ${url.href}`);
          return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (url.pathname.endsWith('.txt')) {
          console.log(`[SW] ↩️ Serving empty text fallback: ${url.href}`);
          return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
        console.log(`[SW] ↩️ Serving generic empty fallback: ${url.href}`);
        return new Response('', { status: 200 });
      }
    })()
  );
});


