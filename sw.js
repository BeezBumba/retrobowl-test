const CACHE_NAME = 'RETROBOWL-v1';

const RAW_ASSETS = [
  // ... (same list as before)
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
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log(`[SW] 🗑 Deleting old cache: ${key}`);
          return caches.delete(key);
        })
      )
    )
  );
});

const RUNTIME_CACHE = 'runtime-third-party';

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignore analytics / Cloudflare RUM / ad beacons
  if (
    url.pathname.startsWith('/cdn-cgi/rum') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('cmp.inmobi.com')
  ) {
    event.respondWith(new Response(undefined, { status: 204 }));
    return;
  }

  // Runtime caching for selected external hosts
  const runtimeHosts = [
    'geo.poki.io',
    'leveldata.poki.io',
    'securepubads.g.doubleclick.net',
    'imasdk.googleapis.com',
    'c.amazon-adsystem.com',
    'cdn.jsdelivr.net',
    'config.aps.amazon-adsystem.com',
    's0.2mdn.net'
  ];

  if (runtimeHosts.includes(url.hostname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async cache => {
        const cached = await cache.match(event.request, { ignoreSearch: true });
        if (cached) {
          console.log(`[SW] 🌐 Serving external from runtime cache: ${url.href}`);
          return cached;
        }
        console.log(`[SW] 🌐 Fetching & caching external: ${url.href}`);
        try {
          const res = await fetch(event.request);
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        } catch (err) {
          console.warn(`[SW] ❌ External fetch failed: ${url.href}`, err);
          return new Response('', { status: 200 });
        }
      })
    );
    return;
  }

  // Cache‑first for RAW_ASSETS, ignoring query strings for .js/.json
  event.respondWith(
    (async () => {
      let cached;
      if (url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
        cached = await caches.match(event.request, { ignoreSearch: true });
      } else {
        cached = await caches.match(event.request);
      }

      if (cached) {
        console.log(`[SW] Serving from cache: ${url.href}`);
        return cached;
      }

      const relPath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
      const assetShouldBeCached = RAW_ASSETS.some(asset => asset === relPath);

      if (assetShouldBeCached) {
        console.warn(`[SW] 🚨 Requested asset SHOULD be cached but is missing: ${relPath}`);
      } else {
        console.info(`[SW] ℹ️ Requested asset not in RAW_ASSETS: ${relPath}`);
      }

      console.log(`[SW] Fetching from network: ${url.href}`);
      try {
        return await fetch(event.request);
      } catch {
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
        if (url.pathname.endsWith('.json')) {
          return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (url.pathname.endsWith('.txt')) {
          return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
        return new Response('', { status: 200 });
      }
    })()
  );
});
