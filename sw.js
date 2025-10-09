const CACHE_NAME = 'RETROBOWL-v5'; // Increment version to force cache update
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-cache-v5';
const GAME_DATA_CACHE_NAME = 'retrobowl-gamedata-cache-v4';

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

// Critical game files that MUST return valid content
const CRITICAL_GAME_FILES = {
  'Achievements.txt': `achievement_1=First Victory
achievement_2=Season Champion
achievement_3=Perfect Season
achievement_4=Hall of Fame
achievement_5=Dynasty Builder`,
  
  'LanguageUS.txt': `[Language]
version=1.0
@ui_Title=RETRO BOWL
@ui_NewGame=NEW GAME
@ui_Load=LOAD GAME
@conf_AFC=AFC
@conf_NFC=NFC
@division_East=East
@division_West=West
@division_North=North
@division_South=South`,
  
  'LanguageUS_FR.txt': `[Language]
version=1.0`,
  
  'Teams.txt': `[Teams]
team_count=32`,
  
  'uniforms_default.txt': `[Team]
name=Default Team
primary_color=255,0,0
secondary_color=255,255,255
logo=default`,
  
  'PlayerRecords.txt': `[Records]
version=1.0`,
  
  'RetroBowlHOF.txt': `[HallOfFame]
version=1.0`,
  
  'Schedule17.txt': `[Schedule]
version=1.0`,
  
  'Shopping.txt': `[Shop]
version=1.0`,
  
  'Charities.txt': `[Charities]
version=1.0`,
  
  'Colleges.txt': `[Colleges]
version=1.0`,
  
  'Names_F0.txt': `John
Mike
David
Chris
Matt`,
  
  'Names_F1.txt': `Sarah
Emma
Lisa
Amy
Kate`,
  
  'Names_L.txt': `Smith
Johnson
Williams
Brown
Jones`,
  
  'RetroBowl_History.txt': `[History]
version=1.0`
};

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

// Get the filename from a URL
function getFilename(url) {
  return url.split('/').pop().split('?')[0];
}

// Generate content for game files
function getGameFileContent(filename) {
  // Check if we have specific content for this file
  if (CRITICAL_GAME_FILES[filename]) {
    return CRITICAL_GAME_FILES[filename];
  }
  
  // Handle optional files
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
  
  // Default empty content for unknown files
  return '';
}

// Install: cache all assets
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
            if (navigator.onLine) {
              console.error(`[SW] ❌ Failed to cache: ${assetURL(asset)}`, err);
            }
          }
        }
        if (failedAssets.length) {
          console.warn('[SW] ⚠️ Assets that failed to cache:', failedAssets);
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

  // Block analytics and ads to reduce console noise
  if (
    url.pathname.startsWith('/cdn-cgi/rum') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('cmp.inmobi.com') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('google-analytics.com')
  ) {
    console.log(`[SW] 🚫 Blocking analytics/ads request: ${url.href}`);
    event.respondWith(new Response(undefined, { status: 204 }));
    return;
  }

  // Handle HEAD requests for file existence checks
  if (event.request.method === 'HEAD') {
    event.respondWith((async () => {
      // Check static cache first
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) {
        console.log(`[SW] 💡 HEAD from cache: ${url.href}`);
        return new Response('', { status: 200, headers: cached.headers });
      }
      
      // For game files, always return 200 if we can provide content
      if (isGameFileRequest(url.href)) {
        const filename = getFilename(url.href);
        if (CRITICAL_GAME_FILES[filename] || isOptionalGameFile(url.href)) {
          console.log(`[SW] 💡 HEAD for game file (200): ${url.href}`);
          return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
      }
      
      // Try network for other files
      try {
        console.log(`[SW] 📡 HEAD from network: ${url.href}`);
        return await fetch(event.request);
      } catch {
        console.warn(`[SW] ❌ HEAD failed: ${url.href}`);
        return new Response('', { status: 404 });
      }
    })());
    return;
  }

  // Route requests based on type
  if (isGameDataURL(url.href)) {
    event.respondWith(handleGameDataRequest(event.request));
  } else {
    event.respondWith(handleStaticAssetRequest(event.request));
  }
});

// Network First strategy for game data
async function handleGameDataRequest(request) {
  const url = new URL(request.url);
  console.log(`[SW] 🎮 Handling game data request: ${url.href}`);

  try {
    console.log(`[SW] 🌐 Fetching game data from network: ${url.href}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
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
    
    // Check cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`[SW] ✅ Serving game data from cache: ${url.href}`);
      return cachedResponse;
    }
    
    // Provide fallbacks
    if (url.href.includes('leveldata.poki.io/data')) {
      console.log(`[SW] ↩️ Serving level data fallback: ${url.href}`);
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
      console.log(`[SW] ↩️ Serving geo data fallback: ${url.href}`);
      const fallbackGeoData = {
        country: "US",
        region: "offline"
      };
      return new Response(JSON.stringify(fallbackGeoData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First strategy for static assets with guaranteed success for game files
async function handleStaticAssetRequest(request) {
  const url = new URL(request.url);
  
  // 1. Try static cache first
  let cachedResponse = await caches.match(request, { ignoreSearch: true });
  if (cachedResponse) {
    console.log(`[SW] ✅ Serving from static cache: ${url.href}`);
    return cachedResponse;
  }

  // 2. Try runtime cache
  cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`[SW] ✅ Serving from runtime cache: ${url.href}`);
    return cachedResponse;
  }

  // 3. For game files, ALWAYS provide content (critical for synchronous XMLHttpRequest)
  if (isGameFileRequest(url.href)) {
    const filename = getFilename(url.href);
    
    // Try network first for game files
    try {
      console.log(`[SW] 🌐 Fetching game file from network: ${url.href}`);
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful response
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, responseToCache);
        console.log(`[SW] ✨ Cached game file: ${url.href}`);
        return networkResponse;
      }
    } catch (error) {
      console.warn(`[SW] ⚠️ Network failed for game file: ${url.href}`);
    }
    
    // ALWAYS provide fallback content for game files
    const content = getGameFileContent(filename);
    console.log(`[SW] ↩️ Serving fallback content for game file: ${url.href}`);
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 4. For non-game files, try network
  try {
    console.log(`[SW] 🌐 Fetching from network: ${url.href}`);
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === 'GET' && networkResponse.type === 'basic') {
      const responseToCache = networkResponse.clone();
      const cacheName = isCriticalGameResource(url.href) ? CACHE_NAME : RUNTIME_CACHE_NAME;
      
      caches.open(cacheName).then(cache => {
        cache.put(request, responseToCache);
        console.log(`[SW] ✨ Dynamically cached: ${url.href}`);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error(`[SW] ❌ Network fetch failed for ${url.href}:`, error);

    // Navigation fallback
    if (request.mode === 'navigate') {
      console.log(`[SW] ↩️ Serving index.html fallback: ${url.href}`);
      return caches.match('index.html');
    }
    
    // Generic fallbacks
    if (url.pathname.endsWith('.json')) {
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response('', { status: 200 });
  }
}
