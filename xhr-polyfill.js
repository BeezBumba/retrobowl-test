// XHR Polyfill v12 - Persistent Cache with localStorage
// Caches files in localStorage so they survive page reloads
// Serves synchronously from cache offline!

(function() {
  'use strict';
  
  console.log('%c[XHR Polyfill v12] 🚀 Installing Persistent Cache Polyfill...', 'color: #00ff00; font-weight: bold');
  
  const CACHE_PREFIX = 'xhr_cache_';
  const CACHE_INDEX_KEY = 'xhr_cache_index';
  
  // Get list of cached files
  function getCacheIndex() {
    try {
      const index = localStorage.getItem(CACHE_INDEX_KEY);
      return index ? JSON.parse(index) : [];
    } catch (e) {
      console.error('[XHR v12] Error reading cache index:', e);
      return [];
    }
  }
  
  // Update cache index
  function updateCacheIndex(urls) {
    try {
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(urls));
    } catch (e) {
      console.error('[XHR v12] Error updating cache index:', e);
    }
  }
  
  // Get cached file
  function getCachedFile(url) {
    try {
      const key = CACHE_PREFIX + url;
      return localStorage.getItem(key);
    } catch (e) {
      console.error('[XHR v12] Error reading cache:', e);
      return null;
    }
  }
  
  // Cache a file
  function cacheFile(url, data) {
    try {
      const key = CACHE_PREFIX + url;
      localStorage.setItem(key, data);
      
      // Update index
      const index = getCacheIndex();
      if (!index.includes(url)) {
        index.push(url);
        updateCacheIndex(index);
      }
      
      return true;
    } catch (e) {
      console.error('[XHR v12] Error caching file:', e);
      return false;
    }
  }
  
  // Check cache status
  const cacheIndex = getCacheIndex();
  console.log(`%c[XHR v12] 📦 Found ${cacheIndex.length} cached files in localStorage`, 'color: #00aaff');
  cacheIndex.forEach(url => {
    const data = getCachedFile(url);
    if (data) {
      console.log(`  - ${url} (${data.length} bytes)`);
    }
  });
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Track files to cache
  const filesToCache = new Set();
  
  // Pre-cache a file using fetch
  async function preCacheFile(url) {
    if (getCachedFile(url)) {
      console.log(`%c[XHR v12] 📦 Already cached: ${url}`, 'color: #888');
      return;
    }
    
    try {
      console.log(`%c[XHR v12] 📥 Caching: ${url}`, 'color: #00aaff');
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (cacheFile(url, text)) {
          console.log(`%c[XHR v12] ✅ Cached: ${url} (${text.length} bytes)`, 'color: #00ff00');
        }
      } else {
        console.log(`%c[XHR v12] ⚠️ Failed: ${url} (${response.status})`, 'color: #ff8800');
      }
    } catch (error) {
      console.log(`%c[XHR v12] ❌ Error: ${url}`, 'color: #ff0000', error);
    }
  }
  
  // Create a wrapper
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true,
      fullUrl: ''
    };
    
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url, async, ...args) {
      state.method = (method || '').toUpperCase();
      state.url = url || '';
      state.async = async !== false;
      
      // Build full URL
      if (state.url.startsWith('http')) {
        state.fullUrl = state.url;
      } else {
        state.fullUrl = new URL(state.url, window.location.href).href;
      }
      
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // Track and pre-cache game files
      if (state.method === 'GET' && isGameFile && isDataFile) {
        if (!filesToCache.has(state.fullUrl)) {
          filesToCache.add(state.fullUrl);
          console.log(`%c[XHR v12] 📝 Discovered: ${state.url}`, 'color: #00aaff');
          
          // Pre-cache in background
          preCacheFile(state.fullUrl);
        }
      }
      
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // For sync GET requests to game files, serve from localStorage
      if (state.method === 'GET' && isGameFile && isDataFile && !state.async) {
        console.log(`%c[XHR v12] 🎯 SYNC: ${state.url}`, 'color: #ff00ff; font-weight: bold');
        
        const cachedData = getCachedFile(state.fullUrl);
        if (cachedData) {
          console.log(`%c[XHR v12] ⚡ From cache: ${state.url} (${cachedData.length} bytes)`, 'color: #00ff00; font-weight: bold');
          
          // Set response synchronously
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => 200, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => 'OK', configurable: true });
          Object.defineProperty(xhr, 'responseText', { get: () => cachedData, configurable: true });
          Object.defineProperty(xhr, 'response', { get: () => cachedData, configurable: true });
          Object.defineProperty(xhr, 'responseURL', { get: () => state.fullUrl, configurable: true });
          
          console.log(`%c[XHR v12] ✅ Sync response ready!`, 'color: #00ff00; font-weight: bold');
          return;
        } else {
          console.log(`%c[XHR v12] ⚠️ Not cached, using native XHR: ${state.url}`, 'color: #ff8800');
        }
      }
      
      // For async GET requests to game files
      if (state.method === 'GET' && isGameFile && isDataFile && state.async) {
        console.log(`%c[XHR v12] 🎯 ASYNC: ${state.url}`, 'color: #8800ff');
        
        const cachedData = getCachedFile(state.fullUrl);
        if (cachedData) {
          console.log(`%c[XHR v12] ⚡ From cache (async): ${state.url}`, 'color: #00ff00');
          
          setTimeout(() => {
            Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
            Object.defineProperty(xhr, 'status', { get: () => 200, configurable: true });
            Object.defineProperty(xhr, 'statusText', { get: () => 'OK', configurable: true });
            Object.defineProperty(xhr, 'responseText', { get: () => cachedData, configurable: true });
            Object.defineProperty(xhr, 'response', { get: () => cachedData, configurable: true });
            
            if (xhr.onreadystatechange) xhr.onreadystatechange();
            if (xhr.onload) xhr.onload();
            if (xhr.onloadend) xhr.onloadend();
          }, 0);
          
          return;
        }
      }
      
      // Native XHR for everything else
      console.log(`%c[XHR v12] ➡️ Native: ${state.method} ${state.url}`, 'color: #888');
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  }
  
  // Copy static properties
  PolyfillXHR.UNSENT = OriginalXHR.UNSENT;
  PolyfillXHR.OPENED = OriginalXHR.OPENED;
  PolyfillXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  PolyfillXHR.LOADING = OriginalXHR.LOADING;
  PolyfillXHR.DONE = OriginalXHR.DONE;
  
  Object.setPrototypeOf(PolyfillXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(PolyfillXHR, OriginalXHR);
  
  window.XMLHttpRequest = PolyfillXHR;
  
  console.log('%c[XHR Polyfill v12] ✅ Installed', 'color: #00ff00; font-weight: bold');
  console.log('%c[XHR Polyfill v12] 💾 Using localStorage for persistent cache', 'color: #00ff00');
})();
