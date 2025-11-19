// XHR Polyfill v6 - Smart Fallback Strategy
// Uses native XHR online, falls back to fetch() when XHR fails (offline)

(function() {
  'use strict';
  
  console.log('[XHR Polyfill v6] 🚀 Installing smart fallback polyfill...');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a wrapper that extends the original
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true,
      usedFallback: false
    };
    
    // Store original methods
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // Override open to capture request details
    xhr.open = function(method, url, async, ...args) {
      state.method = (method || '').toUpperCase();
      state.url = url || '';
      state.async = async !== false;
      
      console.log(`[XHR Polyfill v6] 📋 ${state.method} ${state.url}`);
      
      // Call original
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send with smart fallback
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // Always simulate HEAD requests for game data files
      if (state.method === 'HEAD' && isGameFile && isDataFile) {
        console.log(`[XHR Polyfill v6] ⚡ Simulating HEAD for ${state.url}`);
        
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
      
      // For GET requests to game data files, try native XHR first
      if (state.method === 'GET' && isGameFile && isDataFile) {
        console.log(`[XHR Polyfill v6] 🔄 Trying native XHR for ${state.url}`);
        
        // Set up error handler to catch offline failures
        const originalOnError = xhr.onerror;
        xhr.onerror = function(e) {
          // If native XHR fails (likely offline), try fetch() as fallback
          if (!state.usedFallback) {
            console.log(`[XHR Polyfill v6] ⚠️ Native XHR failed, trying fetch() fallback for ${state.url}`);
            state.usedFallback = true;
            
            fetch(state.url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
              })
              .then(text => {
                console.log(`[XHR Polyfill v6] ✅ Loaded via fetch(): ${state.url} (${text.length} bytes)`);
                
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
                
                // Fire success events
                if (xhr.onreadystatechange) xhr.onreadystatechange();
                if (xhr.onload) xhr.onload();
                if (xhr.onloadend) xhr.onloadend();
              })
              .catch(fetchError => {
                console.error(`[XHR Polyfill v6] ❌ Both XHR and fetch() failed for ${state.url}:`, fetchError);
                // Call original error handler if it exists
                if (originalOnError) originalOnError.call(xhr, e);
              });
          } else {
            // Already tried fallback, call original error handler
            if (originalOnError) originalOnError.call(xhr, e);
          }
        };
        
        // Try native XHR first
        return originalSend.apply(this, [body]);
      }
      
      // For everything else, use native XHR
      console.log(`[XHR Polyfill v6] ➡️ Using native XHR for ${state.method} ${state.url}`);
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
  
  console.log('[XHR Polyfill v6] ✅ Installed successfully');
  console.log('[XHR Polyfill v6] 📝 Strategy: Native XHR first, fetch() fallback on error');
})();
