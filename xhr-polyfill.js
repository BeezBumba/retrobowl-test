// XHR Polyfill v11 - Pre-Cache + Synchronous Serving
// Pre-loads all game files into memory, then serves them synchronously
// This allows sync XHR to work offline!

(function() {
  'use strict';
  
  console.log('%c[XHR Polyfill v11] 🚀 Installing Pre-Cache Polyfill...', 'color: #00ff00; font-weight: bold');
  
  // Cache for pre-loaded files
  const fileCache = new Map();
  let cacheReady = false;
  
  // List of files to pre-cache (we'll discover these dynamically)
  const filesToCache = new Set();
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Pre-load a file using fetch
  async function preCacheFile(url) {
    if (fileCache.has(url)) {
      console.log(`%c[XHR v11] 📦 Already cached: ${url}`, 'color: #888');
      return;
    }
    
    try {
      console.log(`%c[XHR v11] 📥 Pre-caching: ${url}`, 'color: #00aaff');
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        fileCache.set(url, text);
        console.log(`%c[XHR v11] ✅ Cached: ${url} (${text.length} bytes)`, 'color: #00ff00');
      } else {
        console.log(`%c[XHR v11] ⚠️ Failed to cache: ${url} (${response.status})`, 'color: #ff8800');
      }
    } catch (error) {
      console.log(`%c[XHR v11] ❌ Error caching: ${url}`, 'color: #ff0000', error);
    }
  }
  
  // Pre-cache all discovered files
  async function preCacheAll() {
    console.log(`%c[XHR v11] 🔄 Pre-caching ${filesToCache.size} files...`, 'color: #ffaa00; font-weight: bold');
    
    const promises = Array.from(filesToCache).map(url => preCacheFile(url));
    await Promise.all(promises);
    
    cacheReady = true;
    console.log(`%c[XHR v11] ✅ Pre-cache complete! ${fileCache.size} files ready`, 'color: #00ff00; font-weight: bold');
  }
  
  // Create a wrapper that extends the original
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true,
      fullUrl: ''
    };
    
    // Store original methods
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // Override open to capture request details
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
      
      // Track files for pre-caching
      if (state.method === 'GET' && isGameFile && isDataFile) {
        if (!filesToCache.has(state.fullUrl)) {
          filesToCache.add(state.fullUrl);
          console.log(`%c[XHR v11] 📝 Discovered file: ${state.url}`, 'color: #00aaff');
          
          // Pre-cache in background if not already caching
          if (!cacheReady) {
            preCacheFile(state.fullUrl);
          }
        }
      }
      
      // Call original
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send to serve from cache for sync requests
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // For sync GET requests to game data files, serve from cache
      if (state.method === 'GET' && isGameFile && isDataFile && !state.async) {
        console.log(`%c[XHR v11] 🎯 SYNC request: ${state.url}`, 'color: #ff00ff; font-weight: bold');
        
        // Check if we have it in cache
        if (fileCache.has(state.fullUrl)) {
          const cachedData = fileCache.get(state.fullUrl);
          console.log(`%c[XHR v11] ⚡ Serving from cache: ${state.url} (${cachedData.length} bytes)`, 'color: #00ff00; font-weight: bold');
          
          // Set response properties synchronously
          Object.defineProperty(xhr, 'readyState', { 
            get: () => 4, 
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(xhr, 'status', { 
            get: () => 200, 
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(xhr, 'statusText', { 
            get: () => 'OK', 
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(xhr, 'responseText', { 
            get: () => cachedData, 
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(xhr, 'response', { 
            get: () => cachedData, 
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(xhr, 'responseURL', { 
            get: () => state.fullUrl, 
            configurable: true,
            enumerable: true
          });
          
          // For sync requests, events fire after send() returns
          // But we need to make the response available immediately
          // So we DON'T call the original send
          
          console.log(`%c[XHR v11] ✅ Sync response ready!`, 'color: #00ff00; font-weight: bold');
          return; // Don't call original send
        } else {
          console.log(`%c[XHR v11] ⚠️ Not in cache yet, using native XHR: ${state.url}`, 'color: #ff8800');
          // Fall through to native XHR
        }
      }
      
      // For async GET requests to game data files, try cache first
      if (state.method === 'GET' && isGameFile && isDataFile && state.async) {
        console.log(`%c[XHR v11] 🎯 ASYNC request: ${state.url}`, 'color: #8800ff');
        
        if (fileCache.has(state.fullUrl)) {
          const cachedData = fileCache.get(state.fullUrl);
          console.log(`%c[XHR v11] ⚡ Serving from cache (async): ${state.url}`, 'color: #00ff00');
          
          // Set up async response
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
          
          return; // Don't call original send
        }
      }
      
      // For everything else, use native XHR
      console.log(`%c[XHR v11] ➡️ Native XHR: ${state.method} ${state.url}`, 'color: #888');
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
  
  // Set up prototype chain
  Object.setPrototypeOf(PolyfillXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(PolyfillXHR, OriginalXHR);
  
  // Replace global XMLHttpRequest
  window.XMLHttpRequest = PolyfillXHR;
  
  // Pre-cache files after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (filesToCache.size > 0 && !cacheReady) {
        preCacheAll();
      }
    }, 2000); // Wait 2 seconds after page load
  });
  
  console.log('%c[XHR Polyfill v11] ✅ Installed', 'color: #00ff00; font-weight: bold');
  console.log('%c[XHR Polyfill v11] 📝 Will pre-cache files and serve synchronously', 'color: #00ff00');
})();
