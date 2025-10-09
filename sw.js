const CACHE_NAME = 'RETROBOWL-v4'; // Increment version to force cache update
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-cache-v4';
const GAME_DATA_CACHE_NAME = 'retrobowl-gamedata-cache-v3';

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

// Game data URLs that need network-first caching
const GAME_DATA_URLS = [
  'leveldata.poki.io/data',
  'geo.poki.io'
];

// Game files that might not exist but should have fallbacks
const OPTIONAL_GAME_FILES = [
  'uniforms_custom_1.txt',
  'uniforms_custom_2.txt',
  'uniforms_custom_3.txt',
  'uniforms_custom_4.txt',
  'uniforms_custom_5.txt',
  'savedata.ini',
  'savedata2.ini',
  'savedata3.ini',
  'savedata4.ini',
  'savedata5.ini'
];

function assetURL(asset) {
  return new URL(asset, self.location.origin).href;
}

// Check if URL is a game data endpoint
function isGameDataURL(url) {
  return GAME_DATA_URLS.some(gameDataUrl => url.includes(gameDataUrl));
}

// Check if URL is a critical game resource
function isCriticalGameResource(url) {
  const criticalPatterns = [
    '/html5game/',
    '/sdk/',
    'RetroBowl.js',
    'poki-sdk'
  ];
  return criticalPatterns.some(pattern => url.includes(pattern));
}

// Check if this is an optional game file that might not exist
function isOptionalGameFile(url) {
  return OPTIONAL_GAME_FILES.some(file => url.includes(file));
}

// Check if this is a game file request (html5game directory)
function isGameFileRequest(url) {
  return url.includes('/html5game/');
}

// Generate default content for missing game files
function getDefaultFileContent(filename) {
  if (filename.includes('uniforms_custom')) {
    return `[Team]
name=Custom Team
primary_color=255,0,0
secondary_color=255,255,255
logo=default`;
  }
  
  if (filename.includes('savedata')) {
    return `[Save]
version=1.0
created=0
modified=0`;
  }
  
  if (filename.includes('Achievements.txt')) {
    // Provide a minimal achievements file
    return `achievement_1=First Victory
achievement_2=Season Champion
achievement_3=Perfect Season`;
  }
  
  if (filename.includes('LanguageUS_FR.txt')) {
    // Provide empty language file
    return `[Language]
version=1.0`;
  }
  
  // Default empty content
  return '';
}

// Install: cache all assets, log failures and verify after
self.addEventListener('install', event => {
  console.log('[SW] 🔧 Install event triggered');
  event.waitUntil(
    Promise.all([
      // Cache static assets
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
      }),
      
      // Initialize game data cache
      caches.open(GAME_DATA_CACHE_NAME).then(cache => {
        console.log(`[SW] 📦 Initialized game data cache: ${GAME_DATA_CACHE_NAME}`);
      })
    ]).catch(err => {
      console.error('[SW] 🚨 Cache initialization failed:', err);
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => 
          key !== CACHE_NAME && 
          key !== RUNTIME_CACHE_NAME && 
          key !== GAME_DATA_CACHE_NAME
        ).map(key => {
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
      // First check static cache
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) {
        console.log(`[SW] 💡 Serving HEAD from cache: ${url.href}`);
        return new Response('', { status: 200, headers: cached.headers });
      }
      
      // Check if this is an optional file that might not exist
      if (isOptionalGameFile(url.href)) {
        console.log(`[SW] 💡 Optional file HEAD request (returning 404): ${url.href}`);
        // Return 404 for optional files that don't exist - this is expected behavior
        return new Response('', { status: 404 });
      }
      
      // For game files that should exist but aren't cached, return 200
      if (isGameFileRequest(url.href)) {
        console.log(`[SW] 💡 Game file HEAD request (returning 200): ${url.href}`);
        return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
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

  // Strategy selection based on resource type
  if (isGameDataURL(url.href)) {
    // Network First strategy for game data
    event.respondWith(handleGameDataRequest(event.request));
  } else {
    // Cache First strategy for static assets
    event.respondWith(handleStaticAssetRequest(event.request));
  }
});

// Network First strategy for critical game data
async function handleGameDataRequest(request) {
  const url = new URL(request.url);
  console.log(`[SW] 🎮 Handling game data request: ${url.href}`);

  try {
    // Try network first
    console.log(`[SW] 🌐 Fetching game data from network: ${url.href}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful response
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(GAME_DATA_CACHE_NAME);
      await cache.put(request, responseToCache);
      console.log(`[SW] ✨ Cached game data: ${url.href}`);
      return networkResponse;
    } else {
      throw new Error(`Network response not ok: ${networkResponse.status}`);
    }
  } catch (error) {
    console.error(`[SW] ❌ Network fetch failed for game data ${url.href}:`, error);
    
    // Fall back to cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`[SW] ✅ Serving game data from cache: ${url.href}`);
      return cachedResponse;
    }
    
    // Provide meaningful fallback for specific endpoints
    if (url.href.includes('leveldata.poki.io/data')) {
      console.log(`[SW] ↩️ Serving default level data fallback: ${url.href}`);
      // Provide a minimal valid response that allows the game to function
      const fallbackData = {
        levels: [],
        version: "offline",
        timestamp: Date.now()
      };
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.href.includes('geo.poki.io')) {
      console.log(`[SW] ↩️ Serving default geo data fallback: ${url.href}`);
      const fallbackGeoData = {
        country: "US",
        region: "offline"
      };
      return new Response(JSON.stringify(fallbackGeoData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generic JSON fallback
    console.log(`[SW] ↩️ Serving generic JSON fallback: ${url.href}`);
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First strategy for static assets
async function handleStaticAssetRequest(request) {
  const url = new URL(request.url);
  
  // 1. Try to serve from static cache first
  let cachedResponse = await caches.match(request, { ignoreSearch: true });
  if (cachedResponse) {
    console.log(`[SW] ✅ Serving from static cache: ${url.href}`);
    return cachedResponse;
  }

  // 2. If not in static cache, try runtime cache
  cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`[SW] ✅ Serving from runtime cache: ${url.href}`);
    return cachedResponse;
  }

  // 3. If not in any cache, go to network
  console.log(`[SW] 🌐 Fetching from network: ${url.href}`);
  try {
    const networkResponse = await fetch(request);

    // Cache successful GET requests for basic resources
    if (networkResponse.ok && request.method === 'GET' && networkResponse.type === 'basic') {
      const responseToCache = networkResponse.clone();
      const cacheName = isCriticalGameResource(url.href) ? CACHE_NAME : RUNTIME_CACHE_NAME;
      
      caches.open(cacheName).then(cache => {
        cache.put(request, responseToCache);
        console.log(`[SW] ✨ Dynamically cached: ${url.href}`);
      }).catch(err => {
        console.error(`[SW] ⚠️ Failed to dynamically cache ${url.href}:`, err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error(`[SW] ❌ Network fetch failed for ${url.href}:`, error);

    // 4. Fallback logic if network fails
    if (request.mode === 'navigate') {
      console.log(`[SW] ↩️ Serving index.html fallback for navigation: ${url.href}`);
      return caches.match('index.html');
    }
    
    // Special handling for game files
    if (isGameFileRequest(url.href)) {
      const filename = url.pathname.split('/').pop();
      const defaultContent = getDefaultFileContent(filename);
      console.log(`[SW] ↩️ Serving default content for game file: ${url.href}`);
      return new Response(defaultContent, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Handle optional game files that might not exist
    if (isOptionalGameFile(url.href)) {
      const filename = url.pathname.split('/').pop();
      const defaultContent = getDefaultFileContent(filename);
      console.log(`[SW] ↩️ Serving default content for optional file: ${url.href}`);
      return new Response(defaultContent, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
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
}
