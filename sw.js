const CACHE_NAME = 'RETROBOWL-v1';
const BASE_PATH = '/retrobowl-test';

const RAW_ASSETS = [
  '/', 
  '/index.html',
  '/register_sw.js',
  '/manifest.json',
  '/sdk/poki-sdk.js', 
  '/favicon.ico',
  '/rb192.jpg',
  '/img/icon.png',
  '/img/splash.png',
  '/js/main.js',
  '/js/main_unpacked.js',
  '/sdk/details.json',
  '/sdk/prebid.js',
  '/sdk/settings.json',
  '/sdk/core.js/poki-sdk-core-.js',
  '/rb400.jpg', 
  '/rb64.jpg',
  '/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js',
  '/html5game/sound/worklets/audio-worklet.js',
  '/html5game/Achievements.txt',
  '/html5game/Charities.txt',
  '/html5game/Colleges.txt',
  '/html5game/LanguageUS.txt',
  '/html5game/LanguageUS_FR.txt',
  '/html5game/Names_F0.txt',
  '/html5game/Names_F1.txt',
  '/html5game/Names_L.txt',
  '/html5game/PlayerRecords.txt',
  '/html5game/RetroBowl.js',
  '/html5game/RetroBowlHOF.txt',
  '/html5game/RetroBowl_History.txt',
  '/html5game/RetroBowl_texture_0.png',
  '/html5game/RetroBowl_texture_1.png',
  '/html5game/RetroBowl_texture_2.png',
  '/html5game/RetroBowl_texture_3.png',
  '/html5game/Schedule17.txt',
  '/html5game/Shopping.txt',
  '/html5game/Teams.txt',
  '/html5game/code.css',
  '/html5game/code.txt',
  '/html5game/snd_audible.ogg',
  '/html5game/snd_audience_dis.ogg',
  '/html5game/snd_audience_fg.ogg',
  '/html5game/snd_audience_idle.ogg',
  '/html5game/snd_beep.ogg',
  '/html5game/snd_beep2.ogg',
  '/html5game/snd_bounce.ogg',
  '/html5game/snd_click.ogg',
  '/html5game/snd_drink.ogg',
  '/html5game/snd_error.ogg',
  '/html5game/snd_kick.ogg',
  '/html5game/snd_music.ogg',
  '/html5game/snd_oof1.ogg',
  '/html5game/snd_oof2.ogg',
  '/html5game/snd_oof3.ogg',
  '/html5game/snd_post.ogg',
  '/html5game/snd_purchase.ogg',
  '/html5game/snd_starrating.ogg',
  '/html5game/snd_success.ogg',
  '/html5game/snd_tackle.ogg',
  '/html5game/snd_throw.ogg',
  '/html5game/snd_timeout.ogg',
  '/html5game/splash.png',
  '/html5game/uniforms_default.txt',
  '/html5game/uph_poki.js'
];

// Prefix all assets with /retrobowl-test
const ASSETS_TO_CACHE = RAW_ASSETS.map(path =>
  path === '/' ? BASE_PATH + '/' : BASE_PATH + path
);

// Install: cache all assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
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
          console.log(`[SW] Deleting old cache: ${key}`);
          return caches.delete(key);
        })
      )
    )
  );
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  console.log(`[SW] Fetching: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log(`[SW] Serving from cache: ${event.request.url}`);
        return cachedResponse;
      }
      console.log(`[SW] Fetching from network: ${event.request.url}`);
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(BASE_PATH + '/index.html');
        }
      });
    })
  );
});
