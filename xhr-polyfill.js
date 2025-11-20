// XHR Polyfill v8 - Offline Detection + fetch() Replacement
// Detects offline mode and uses fetch() for game files to work with service worker

(function() {
  'use strict';
  
  console.log('[XHR Polyfill v8] 🚀 Installing offline-aware polyfill...');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a wrapper that extends the original
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true
    };
    
    // Store original methods
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // Override open to capture request details
    xhr.open = function(method, url, async, ...args) {
      state.method = (method || '').toUpperCase();
      state.url = url || '';
      state.async = async !== false;
      
      console.log(`[XHR Polyfill v8] 📋 ${state.method} ${state.url}`);
      
      // Call original
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send to use fetch() for game files
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // For GET requests to game data files, use fetch() instead of XHR
      // This allows service worker to intercept even when offline
      if (state.method === 'GET' && isGameFile && isDataFile) {
        console.log(`[XHR Polyfill v8] 🌐 Using fetch() for ${state.url}`);
        
        fetch(state.url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            console.log(`[XHR Polyfill v8] ✅ Loaded ${state.url} (${text.length} bytes)`);
            
            // Set response properties
            Object.defineProperty(xhr, 'readyState', { 
              get: () => 4, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'status', { 
              get: () => 200, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'statusText', { 
              get: () => 'OK', 
              configurable: true 
            });
            Object.defineProperty(xhr, 'responseText', { 
              get: () => text, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'response', { 
              get: () => text, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'responseURL', { 
              get: () => state.url, 
              configurable: true 
            });
            
            // Fire events in correct order
            if (xhr.onreadystatechange) {
              // Fire readyState changes
              Object.defineProperty(xhr, 'readyState', { get: () => 2, configurable: true });
              xhr.onreadystatechange();
              Object.defineProperty(xhr, 'readyState', { get: () => 3, configurable: true });
              xhr.onreadystatechange();
              Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
              xhr.onreadystatechange();
            }
            if (xhr.onload) xhr.onload();
            if (xhr.onloadend) xhr.onloadend();
          })
          .catch(error => {
            console.error(`[XHR Polyfill v8] ❌ Failed to load ${state.url}:`, error);
            
            // Set error state
            Object.defineProperty(xhr, 'readyState', { 
              get: () => 4, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'status', { 
              get: () => 0, 
              configurable: true 
            });
            Object.defineProperty(xhr, 'statusText', { 
              get: () => '', 
              configurable: true 
            });
            
            // Fire error events
            if (xhr.onerror) xhr.onerror();
            if (xhr.onloadend) xhr.onloadend();
          });
        
        return; // Don't call original send
      }
      
      // For HEAD requests to game data files, simulate success
      // (Service worker can't intercept HEAD requests reliably)
      if (state.method === 'HEAD' && isGameFile && isDataFile) {
        console.log(`[XHR Polyfill v8] ⚡ Simulating HEAD for ${state.url}`);
        
        setTimeout(() => {
          Object.defineProperty(xhr, 'readyState', { 
            get: () => 4, 
            configurable: true 
          });
          Object.defineProperty(xhr, 'status', { 
            get: () => 200, 
            configurable: true 
          });
          Object.defineProperty(xhr, 'statusText', { 
            get: () => 'OK', 
            configurable: true 
          });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload();
          if (xhr.onloadend) xhr.onloadend();
        }, 0);
        
        return;
      }
      
      // For everything else, use native XHR
      console.log(`[XHR Polyfill v8] ➡️ Using native XHR for ${state.method} ${state.url}`);
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
  
  console.log('[XHR Polyfill v8] ✅ Installed successfully');
  console.log('[XHR Polyfill v8] 📝 Strategy: fetch() for GET, simulate HEAD, native XHR for others');
})();
