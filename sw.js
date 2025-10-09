const CACHE_NAME = 'RETROBOWL-v6';
const RUNTIME_CACHE_NAME = 'retrobowl-runtime-v6';
const GAME_DATA_CACHE_NAME = 'retrobowl-gamedata-v6';

// Critical game files with fallback content
const GAME_FILE_CONTENT = {
  'Achievements.txt': `achievement_1=First Victory
achievement_2=Season Champion
achievement_3=Perfect Season
achievement_4=Hall of Fame
achievement_5=Dynasty Builder
achievement_6=Rookie of the Year
achievement_7=MVP Award
achievement_8=Championship Ring
achievement_9=Perfect Game
achievement_10=Legend Status`,
  
  'LanguageUS.txt': `[Language]
version=1.0
@ui_Title=RETRO BOWL
@ui_NewGame=NEW GAME
@ui_Load=LOAD GAME
@ui_Continue=CONTINUE
@ui_Options=OPTIONS
@ui_Credits=CREDITS
@conf_AFC=AFC
@conf_NFC=NFC
@division_East=East
@division_West=West
@division_North=North
@division_South=South
@ui_Version_Mode=Version Mode`,
  
  'LanguageUS_FR.txt': `[Language]
version=1.0`,
  
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
Mark`,
  
  'Names_F1.txt': `Sarah
Emma
Lisa
Amy
Kate
Anna
Beth
Carol
Diana
Eve`,
  
  'Names_L.txt': `Smith
Johnson
Williams
Brown
Jones
Garcia
Miller
Davis
Rodriguez
Martinez`,
  
  'RetroBowl_History.txt': `[History]
version=1.0
season_count=0`,
  
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

// Assets to cache during install
const STATIC_ASSETS = [
  'index.html',
  'register_sw.js',
  'manifest.json',
  'sdk/poki-sdk.js',
  'favicon.ico',
  'rb192.jpg',
  'html5game/RetroBowl.js',
  'html5game/splash.png',
  'html5game/uph_poki.js',
  'html5game/RetroBowl_texture_0.png',
  'html5game/RetroBowl_texture_1.png',
  'html5game/RetroBowl_texture_2.png',
  'html5game/RetroBowl_texture_3.png',
  'html5game/sound/worklets/audio-worklet.js',
  'html5game/snd_audience_dis.ogg',
  'html5game/snd_audience_fg.ogg',
  'html5game/snd_beep.ogg',
  'html5game/snd_beep2.ogg',
  'html5game/snd_bounce.ogg',
  'html5game/snd_click.ogg',
  'html5game/snd_kick.ogg',
  'html5game/snd_oof1.ogg',
  'html5game/snd_oof2.ogg',
  'html5game/snd_error.ogg',
  'html5game/snd_oof3.ogg',
  'html5game/snd_post.ogg',
  'html5game/snd_throw.ogg',
  'html5game/snd_tackle.ogg',
  'html5game/snd_audible.ogg',
  'html5game/snd_timeout.ogg',
  'html5game/snd_purchase.ogg',
  'html5game/snd_audience_idle.ogg',
  'html5game/snd_success.ogg',
  'html5game/snd_drink.ogg',
  'html5game/snd_starrating.ogg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] 🔧 Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 📦 Caching static assets...');
      return cache.addAll(STATIC_ASSETS.map(asset => new Request(asset, {cache: 'reload'})));
    }).then(() => {
      console.log('[SW] ✅ Installation complete');
      return self.skipWaiting();
    }).catch(err => {
      console.error('[SW] ❌ Installation failed:', err);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] 🚀 Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME && cacheName !== GAME_DATA_CACHE_NAME) {
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

// Fetch event - intercept ALL requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const filename = pathname.split('/').pop();
  
  console.log(`[SW] 🔍 Intercepting: ${event.request.method} ${url.href}`);
  
  // Block analytics and ads
  if (
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('cmp.inmobi.com') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com')
  ) {
    console.log(`[SW] 🚫 Blocking: ${url.href}`);
    event.respondWith(new Response('', { status: 204 }));
    return;
  }
  
  // Handle HEAD requests
  if (event.request.method === 'HEAD') {
    event.respondWith(handleHeadRequest(event.request));
    return;
  }
  
  // Handle game data requests
  if (url.hostname.includes('leveldata.poki.io') || url.hostname.includes('geo.poki.io')) {
    event.respondWith(handleGameDataRequest(event.request));
    return;
  }
  
  // Handle game file requests - THIS IS CRITICAL
  if (pathname.includes('/html5game/') && pathname.endsWith('.txt')) {
    console.log(`[SW] 🎮 Game file request: ${filename}`);
    event.respondWith(handleGameFileRequest(event.request, filename));
    return;
  }
  
  // Handle all other requests
  event.respondWith(handleStaticRequest(event.request));
});

// Handle HEAD requests
async function handleHeadRequest(request) {
  const url = new URL(request.url);
  const filename = url.pathname.split('/').pop();
  
  console.log(`[SW] 💡 HEAD request for: ${filename}`);
  
  // Check cache first
  const cached = await caches.match(request);
  if (cached) {
    console.log(`[SW] ✅ HEAD from cache: ${url.href}`);
    return new Response('', { status: 200, headers: cached.headers });
  }
  
  // For game files, return 200 if we have content
  if (GAME_FILE_CONTENT[filename]) {
    console.log(`[SW] ✅ HEAD for game file (200): ${filename}`);
    return new Response('', { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // Try network
  try {
    const response = await fetch(request);
    console.log(`[SW] ✅ HEAD from network: ${url.href}`);
    return response;
  } catch (error) {
    console.log(`[SW] ❌ HEAD failed, returning 404: ${url.href}`);
    return new Response('', { status: 404 });
  }
}

// Handle game file requests - GUARANTEED SUCCESS
async function handleGameFileRequest(request, filename) {
  const url = new URL(request.url);
  
  console.log(`[SW] 🎯 Handling game file: ${filename}`);
  
  // Try cache first
  const cached = await caches.match(request);
  if (cached) {
    console.log(`[SW] ✅ Game file from cache: ${filename}`);
    return cached;
  }
  
  // Try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ Game file from network: ${filename}`);
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log(`[SW] ⚠️ Network failed for game file: ${filename}`);
  }
  
  // ALWAYS provide fallback content
  const content = GAME_FILE_CONTENT[filename] || '';
  console.log(`[SW] ↩️ Serving fallback for: ${filename}`);
  
  const response = new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=3600'
    }
  });
  
  // Cache the fallback
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  
  return response;
}

// Handle game data requests
async function handleGameDataRequest(request) {
  const url = new URL(request.url);
  
  console.log(`[SW] 🎮 Game data request: ${url.href}`);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ Game data from network: ${url.href}`);
      const cache = await caches.open(GAME_DATA_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log(`[SW] ❌ Game data network failed: ${url.href}`);
  }
  
  // Check cache
  const cached = await caches.match(request);
  if (cached) {
    console.log(`[SW] ✅ Game data from cache: ${url.href}`);
    return cached;
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

// Handle static requests
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  
  // Try cache first
  const cached = await caches.match(request);
  if (cached) {
    console.log(`[SW] ✅ Static from cache: ${url.href}`);
    return cached;
  }
  
  // Try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log(`[SW] ✅ Static from network: ${url.href}`);
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch (error) {
    console.log(`[SW] ❌ Static request failed: ${url.href}`);
    
    // Navigation fallback
    if (request.mode === 'navigate') {
      const indexResponse = await caches.match('index.html');
      if (indexResponse) {
        console.log(`[SW] ↩️ Navigation fallback: ${url.href}`);
        return indexResponse;
      }
    }
    
    return new Response('', { status: 404 });
  }
}
