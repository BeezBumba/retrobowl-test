const CACHE_NAME = 'RETROBOWL-v9';
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-v9';

// Assets to cache - EXPANDED to include ALL game assets
const STATIC_ASSETS = [
  // Core HTML/JS/Manifest
  'index.html',
  'register_sw.js',
  'manifest.json',
  'favicon.ico',
  'xhr-interceptor-v2.js',
  
  // Icons
  'rb192.jpg',
  'rb400.jpg',
  'rb64.jpg',
  
  // SDK files
  'sdk/poki-sdk.js',
  'sdk/core.js/poki-sdk-core-.js',
  'sdk/details.json',
  'sdk/settings.json',
  'sdk/prebid.js',
  
  // Game core files
  'html5game/RetroBowl.js',
  'html5game/splash.png',
  'html5game/uph_poki.js',
  
  // Textures
  'html5game/RetroBowl_texture_0.png',
  'html5game/RetroBowl_texture_1.png',
  'html5game/RetroBowl_texture_2.png',
  'html5game/RetroBowl_texture_3.png',
  
  // Audio worklet
  'html5game/sound/worklets/audio-worklet.js',
  
  // Sound files - ALL OF THEM
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
  
  // Game data files
  'html5game/Achievements.txt',
  'html5game/Charities.txt',
  'html5game/Colleges.txt',
  'html5game/LanguageUS.txt',
  'html5game/LanguageUS_FR.txt',
  'html5game/Names_F0.txt',
  'html5game/Names_F1.txt',
  'html5game/Names_L.txt',
  'html5game/PlayerRecords.txt',
  'html5game/RetroBowlHOF.txt',
  'html5game/RetroBowl_History.txt',
  'html5game/Schedule17.txt',
  'html5game/Shopping.txt',
  'html5game/Teams.txt',
  'html5game/uniforms_default.txt',
  'html5game/code.css',
  'html5game/code.txt',
  
  // Third-party resources that should be cached
  'cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js'
];

// Install event - with better error handling
self.addEventListener('install', event => {
  console.log('[SW] 🔧 Installing v9...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 📦 Caching assets...');
      // Cache files individually to avoid one failure blocking all
      return Promise.allSettled(
        STATIC_ASSETS.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`[SW] ⚠️ Failed to cache ${url}:`, err.message);
            return null;
          });
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] 🚀 Activating v9...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            console.log('[SW] 🗑 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - intercept ALL requests with improved matching
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const filename = pathname.split('/').pop();
  
  console.log(`[SW] 🔍 ${event.request.method} ${url.href}`);
  
  // Block analytics/ads with proper response
  if (
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('cmp.inmobi.com') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    pathname.startsWith('/cdn-cgi/rum')
  ) {
    console.log(`[SW] 🚫 Blocking: ${url.href}`);
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }
  
  // Handle game data requests
  if (url.hostname.includes('leveldata.poki.io') || url.hostname.includes('geo.poki.io')) {
    event.respondWith(handleGameData(event.request));
    return;
  }
  
  // Check if this is a game file (handle both absolute and relative URLs)
  const isGameFilePath = pathname.includes('/html5game/') || pathname.startsWith('html5game/');
  const isGameFileType = pathname.endsWith('.txt') || pathname.endsWith('.ini');
  
  // ⭐ CRITICAL FIX: Handle HEAD requests BEFORE checking for .txt/.ini
  // This ensures HEAD requests are intercepted even when offline
  if (event.request.method === 'HEAD' && isGameFilePath) {
    console.log(`[SW] 💡 HEAD for game file: ${filename}`);
    event.respondWith(handleGameFileHead(event.request, filename));
    return;
  }
  
  // Handle game file GET requests - CRITICAL PATH
  if (isGameFilePath && isGameFileType) {
    console.log(`[SW] 🎯 GAME FILE: ${filename}`);
    event.respondWith(handleGameFile(event.request, filename));
    return;
  }
  
  // Handle all other requests with improved cache matching
  event.respondWith(handleOtherRequest(event.request));
});

// Handle game file requests with guaranteed success
async function handleGameFile(request, filename) {
  console.log(`[SW] 🎮 Processing game file: ${filename}`);
  
  // Try cache first
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log(`[SW] ✅ Game file from cache: ${filename}`);
      return cached;
    }
  } catch (e) {
    console.warn('[SW] Cache check failed:', e);
  }
  
  // Try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ Game file from network: ${filename}`);
      // Cache successful response
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      } catch (e) {
        console.warn('[SW] Failed to cache network response:', e);
      }
      return response;
    }
  } catch (e) {
    console.warn(`[SW] Network failed for game file: ${filename}`, e);
  }
  
  // Fallback - return 404 for optional files, 200 for required files
  if (filename.includes('savedata') || filename.includes('custom') || filename.includes('optiondata')) {
    console.log(`[SW] ↩️ Fallback 404 for optional file: ${filename}`);
    return new Response('', {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  
  // For required files, return empty 200 (shouldn't happen if cached properly)
  console.log(`[SW] ↩️ Fallback 200 for required file: ${filename}`);
  return new Response('', {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=3600',
      'Content-Length': '0'
    }
  });
}

// Handle HEAD requests for game files - CRITICAL FOR OFFLINE
async function handleGameFileHead(request, filename) {
  console.log(`[SW] 🎯 HEAD request handler for: ${filename}`);
  
  // Check cache for the file
  try {
    const getUrl = request.url;
    const getRequest = new Request(getUrl, { method: 'GET' });
    const cached = await caches.match(getRequest);
    if (cached) {
      console.log(`[SW] ✅ HEAD 200 from cache: ${filename}`);
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': cached.headers.get('Content-Type') || 'text/plain',
          'Content-Length': cached.headers.get('Content-Length') || '0'
        }
      });
    }
  } catch (e) {
    console.warn('[SW] HEAD cache check failed:', e);
  }
  
  // For optional files that don't exist, return 404
  if (filename.includes('custom') || filename.includes('savedata')) {
    console.log(`[SW] ✅ HEAD 404 for optional: ${filename}`);
    return new Response(null, { status: 404 });
  }
  
  // For all other game files, assume they exist and return 200
  // This is critical for offline mode - we tell the game the file exists
  console.log(`[SW] ✅ HEAD 200 (assumed exists): ${filename}`);
  return new Response(null, {
    status: 200,
    headers: { 
      'Content-Type': 'text/plain',
      'Content-Length': '100'  // Fake content length
    }
  });
}

// Handle game data requests
async function handleGameData(request) {
  const url = new URL(request.url);
  console.log(`[SW] 🎮 Game data: ${url.href}`);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ Game data from network: ${url.href}`);
      return response;
    }
  } catch (e) {
    console.warn(`[SW] Game data network failed: ${url.href}`, e);
  }
  
  // Provide fallback
  let fallbackData = {};
  if (url.href.includes('leveldata.poki.io')) {
    fallbackData = { levels: [], version: "offline", timestamp: Date.now() };
  } else if (url.href.includes('geo.poki.io')) {
    fallbackData = { country: "US", region: "offline" };
  }
  
  console.log(`[SW] ↩️ Game data fallback: ${url.href}`);
  return new Response(JSON.stringify(fallbackData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle other requests with improved cache matching
async function handleOtherRequest(request) {
  const url = new URL(request.url);
  
  // Try cache first with ignoreSearch for query parameters
  try {
    const cached = await caches.match(request, { 
      ignoreSearch: true,
      ignoreVary: true 
    });
    if (cached) {
      console.log(`[SW] ✅ From cache: ${url.href}`);
      return cached;
    }
  } catch (e) {
    console.warn('[SW] Cache check failed:', e);
  }
  
  // Try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ From network: ${url.href}`);
      // Cache successful responses (but not for POST/PUT/DELETE)
      if (request.method === 'GET') {
        try {
          const cache = await caches.open(RUNTIME_CACHE_NAME);
          await cache.put(request, response.clone());
        } catch (e) {
          console.warn('[SW] Failed to cache response:', e);
        }
      }
      return response;
    }
    return response;
  } catch (e) {
    console.warn(`[SW] ❌ Request failed: ${url.href}`, e);
    
    // Navigation fallback
    if (request.mode === 'navigate') {
      try {
        const indexResponse = await caches.match('index.html');
        if (indexResponse) {
          console.log(`[SW] ↩️ Navigation fallback: ${url.href}`);
          return indexResponse;
        }
      } catch (e) {
        console.warn('[SW] Navigation fallback failed:', e);
      }
    }
    
    // For sound files, return empty audio response instead of 404
    if (url.pathname.includes('.ogg') || url.pathname.includes('.mp3')) {
      console.log(`[SW] 🔇 Silent fallback for missing audio: ${url.href}`);
      return new Response(new ArrayBuffer(0), {
        status: 200,
        headers: { 'Content-Type': 'audio/ogg' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
