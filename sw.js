const CACHE_NAME = 'RETROBOWL-v9';
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-v9';

// Game file content - comprehensive fallbacks
const GAME_FILES = {
  'Achievements.txt': `achievement_1=First Victory
achievement_2=Season Champion
achievement_3=Perfect Season
achievement_4=Hall of Fame
achievement_5=Dynasty Builder
achievement_6=Rookie of the Year
achievement_7=MVP Award
achievement_8=Championship Ring
achievement_9=Perfect Game
achievement_10=Legend Status
achievement_11=Undefeated Season
achievement_12=Triple Crown
achievement_13=Comeback King
achievement_14=Defensive Player
achievement_15=Offensive Powerhouse`,
  
  'LanguageUS.txt': `[Language]
version=1.0
@ui_Title=RETRO BOWL
@ui_NewGame=NEW GAME
@ui_Load=LOAD GAME
@ui_Continue=CONTINUE
@ui_Options=OPTIONS
@ui_Credits=CREDITS
@ui_SaveSlot1=SAVE SLOT 1
@ui_SaveSlot2=SAVE SLOT 2
@ui_SaveSlot3=SAVE SLOT 3
@ui_SaveSlot4=SAVE SLOT 4
@ui_SaveSlot5=SAVE SLOT 5
@conf_AFC=AFC
@conf_NFC=NFC
@division_East=East
@division_West=West
@division_North=North
@division_South=South
@ui_Version_Mode=Version Mode
@btn_ExhibitionGame=EXHIBITION GAME`,
  
  'LanguageUS_FR.txt': `[Language]
version=1.0
@ui_Title=RETRO BOWL
@ui_NewGame=NOUVEAU JEU`,
  
  'Teams.txt': `[Teams]
team_count=32
version=1.0`,
  
  'uniforms_default.txt': `[Team]
name=Default Team
primary_color=255,0,0
secondary_color=255,255,255
logo=default`,
  
  'PlayerRecords.txt': `[Records]
version=1.0
record_count=0`,
  
  'RetroBowlHOF.txt': `[HallOfFame]
version=1.0
hof_count=0`,
  
  'Schedule17.txt': `[Schedule]
version=1.0
week_count=17`,
  
  'Shopping.txt': `[Shop]
version=1.0
item_count=0`,
  
  'Charities.txt': `[Charities]
version=1.0
charity_count=0`,
  
  'Colleges.txt': `[Colleges]
version=1.0
college_count=100`,
  
  'Names_F0.txt': `John
Mike
David
Chris
Matt
Tom
Steve
Dan
Paul
Mark
Alex
Ryan
Kevin
Brian
Jason`,
  
  'Names_F1.txt': `Sarah
Emma
Lisa
Amy
Kate
Anna
Beth
Carol
Diana
Eve
Grace
Helen
Iris
Jane
Kelly`,
  
  'Names_L.txt': `Smith
Johnson
Williams
Brown
Jones
Garcia
Miller
Davis
Rodriguez
Martinez
Wilson
Anderson
Taylor
Thomas
Jackson`,
  
  'RetroBowl_History.txt': `[History]
version=1.0
season_count=0`,
  
  // Optional files
  'uniforms_custom_1.txt': `[Team]
name=Custom Team 1
primary_color=255,0,0
secondary_color=255,255,255
logo=default`,
  
  'uniforms_custom_2.txt': `[Team]
name=Custom Team 2
primary_color=0,255,0
secondary_color=255,255,255
logo=default`,
  
  'uniforms_custom_3.txt': `[Team]
name=Custom Team 3
primary_color=0,0,255
secondary_color=255,255,255
logo=default`,
  
  'uniforms_custom_4.txt': `[Team]
name=Custom Team 4
primary_color=255,255,0
secondary_color=255,255,255
logo=default`,
  
  'uniforms_custom_5.txt': `[Team]
name=Custom Team 5
primary_color=255,0,255
secondary_color=255,255,255
logo=default`,
  
  'savedata.ini': `[Save]
version=1.0
created=0
modified=0`,
  
  'savedata2.ini': `[Save]
version=1.0
created=0
modified=0`,
  
  'savedata3.ini': `[Save]
version=1.0
created=0
modified=0`,
  
  'savedata4.ini': `[Save]
version=1.0
created=0
modified=0`,
  
  'savedata5.ini': `[Save]
version=1.0
created=0
modified=0`
};

// Assets to cache - EXPANDED to include ALL game assets
const STATIC_ASSETS = [
  // Core HTML/JS/Manifest
  'index.html',
  'register_sw.js',
  'manifest.json',
  'favicon.ico',
  
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
  
  // ⭐ CRITICAL FIX: Handle HEAD requests BEFORE checking for .txt/.ini
  // This ensures HEAD requests are intercepted even when offline
  if (event.request.method === 'HEAD' && pathname.includes('/html5game/')) {
    console.log(`[SW] 💡 HEAD for game file: ${filename}`);
    event.respondWith(handleGameFileHead(event.request, filename));
    return;
  }
  
  // Handle game file GET requests - CRITICAL PATH
  if (pathname.includes('/html5game/') && (pathname.endsWith('.txt') || pathname.endsWith('.ini'))) {
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
  
  // Check if we have predefined content
  if (GAME_FILES[filename]) {
    console.log(`[SW] ✅ Serving predefined content for: ${filename}`);
    const response = new Response(GAME_FILES[filename], {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'max-age=3600',
        'Content-Length': GAME_FILES[filename].length.toString()
      }
    });
    
    // Cache the response
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    } catch (e) {
      console.warn('[SW] Failed to cache game file:', e);
    }
    
    return response;
  }
  
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
  
  // Fallback - return empty content but with 200 status
  console.log(`[SW] ↩️ Fallback for game file: ${filename}`);
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
  
  // Always return 200 for game files that have predefined content
  if (GAME_FILES[filename]) {
    console.log(`[SW] ✅ HEAD 200 for predefined: ${filename}`);
    return new Response(null, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Content-Length': GAME_FILES[filename].length.toString()
      }
    });
  }
  
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
