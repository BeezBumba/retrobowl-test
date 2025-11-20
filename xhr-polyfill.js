// XHR Polyfill v13 - Intercept BOTH XHR and fetch()
// Also intercepts fetch() to catch language file loading

(function() {
  'use strict';
  
  console.log('%c[XHR Polyfill v13] 🚀 Installing (XHR + fetch interception)...', 'color: #00ff00; font-weight: bold');
  
  const CACHE_PREFIX = 'xhr_cache_';
  const CACHE_INDEX_KEY = 'xhr_cache_index';
  
  // Cache functions
  function getCacheIndex() {
    try {
      const index = localStorage.getItem(CACHE_INDEX_KEY);
      return index ? JSON.parse(index) : [];
    } catch (e) {
      return [];
    }
  }
  
  function updateCacheIndex(urls) {
    try {
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(urls));
    } catch (e) {}
  }
  
  function getCachedFile(url) {
    try {
      const key = CACHE_PREFIX + url;
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  
  function cacheFile(url, data) {
    try {
      const key = CACHE_PREFIX + url;
      localStorage.setItem(key, data);
      
      const index = getCacheIndex();
      if (!index.includes(url)) {
        index.push(url);
        updateCacheIndex(index);
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Check cache status
  const cacheIndex = getCacheIndex();
  console.log(`%c[XHR v13] 📦 Found ${cacheIndex.length} cached files`, 'color: #00aaff');
  
  // ========== INTERCEPT FETCH() ==========
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options) {
    const urlString = typeof url === 'string' ? url : url.url || url.href || '';
    const method = (options && options.method) || 'GET';
    
    // Log all fetch requests to Language files
    if (urlString.includes('Language')) {
      console.log(`%c[XHR v13] 🌐 fetch() ${method} ${urlString}`, 'color: #ff00ff; font-weight: bold');
    }
    
    // Check if it's a game file request
    const isGameFile = urlString.includes('/html5game/') || urlString.includes('html5game/');
    const isDataFile = urlString.endsWith('.txt') || urlString.endsWith('.ini');
    
    if (method === 'GET' && isGameFile && isDataFile) {
      // Build full URL
      let fullUrl = urlString;
      if (!fullUrl.startsWith('http')) {
        fullUrl = new URL(fullUrl, window.location.href).href;
      }
      
      // Check cache first
      const cachedData = getCachedFile(fullUrl);
      if (cachedData) {
        console.log(`%c[XHR v13] ⚡ fetch() from cache: ${urlString} (${cachedData.length} bytes)`, 'color: #00ff00; font-weight: bold');
        
        // Return cached data as Response
        return Promise.resolve(new Response(cachedData, {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'text/plain' }
        }));
      } else {
        console.log(`%c[XHR v13] 📥 fetch() from network: ${urlString}`, 'color: #00aaff');
        
        // Fetch from network and cache
        return originalFetch.apply(this, arguments).then(response => {
          if (response.ok) {
            return response.clone().text().then(text => {
              cacheFile(fullUrl, text);
              console.log(`%c[XHR v13] ✅ Cached from fetch: ${urlString} (${text.length} bytes)`, 'color: #00ff00');
              return response;
            });
          }
          return response;
        });
      }
    }
    
    // For everything else, use original fetch
    return originalFetch.apply(this, arguments);
  };
  
  // ========== INTERCEPT XHR ==========
  const OriginalXHR = window.XMLHttpRequest;
  
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
      
      if (state.url.startsWith('http')) {
        state.fullUrl = state.url;
      } else {
        state.fullUrl = new URL(state.url, window.location.href).href;
      }
      
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      if (state.url.includes('Language')) {
        console.log(`%c[XHR v13] 🔍 XHR ${state.method} ${state.url} (async: ${state.async})`, 'color: #ff00ff; font-weight: bold');
      }
      
      if (state.method === 'GET' && isGameFile && isDataFile) {
        if (!getCachedFile(state.fullUrl)) {
          originalFetch(state.fullUrl).then(response => {
            if (response.ok) {
              return response.text();
            }
          }).then(text => {
            if (text) {
              cacheFile(state.fullUrl, text);
              console.log(`%c[XHR v13] ✅ Pre-cached: ${state.url}`, 'color: #00ff00');
            }
          }).catch(() => {});
        }
      }
      
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // For HEAD requests
      if (state.method === 'HEAD' && isGameFile && isDataFile) {
        const cachedData = getCachedFile(state.fullUrl);
        if (cachedData) {
          console.log(`%c[XHR v13] ⚡ HEAD from cache: ${state.url}`, 'color: #00ff00');
          
          setTimeout(() => {
            Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
            Object.defineProperty(xhr, 'status', { get: () => 200, configurable: true });
            Object.defineProperty(xhr, 'statusText', { get: () => 'OK', configurable: true });
            
            if (xhr.onreadystatechange) xhr.onreadystatechange();
            if (xhr.onload) xhr.onload();
            if (xhr.onloadend) xhr.onloadend();
          }, 0);
          
          return;
        }
      }
      
      // For sync GET requests
      if (state.method === 'GET' && isGameFile && isDataFile && !state.async) {
        const cachedData = getCachedFile(state.fullUrl);
        if (cachedData) {
          console.log(`%c[XHR v13] ⚡ SYNC from cache: ${state.url} (${cachedData.length} bytes)`, 'color: #00ff00; font-weight: bold');
          
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => 200, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => 'OK', configurable: true });
          Object.defineProperty(xhr, 'responseText', { get: () => cachedData, configurable: true });
          Object.defineProperty(xhr, 'response', { get: () => cachedData, configurable: true });
          
          return;
        }
      }
      
      // For async GET requests
      if (state.method === 'GET' && isGameFile && isDataFile && state.async) {
        const cachedData = getCachedFile(state.fullUrl);
        if (cachedData) {
          console.log(`%c[XHR v13] ⚡ ASYNC from cache: ${state.url}`, 'color: #00ff00');
          
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
      
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  }
  
  PolyfillXHR.UNSENT = OriginalXHR.UNSENT;
  PolyfillXHR.OPENED = OriginalXHR.OPENED;
  PolyfillXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  PolyfillXHR.LOADING = OriginalXHR.LOADING;
  PolyfillXHR.DONE = OriginalXHR.DONE;
  
  Object.setPrototypeOf(PolyfillXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(PolyfillXHR, OriginalXHR);
  
  window.XMLHttpRequest = PolyfillXHR;
  
  console.log('%c[XHR Polyfill v13] ✅ Installed (XHR + fetch)', 'color: #00ff00; font-weight: bold');
})();
