// XHR Polyfill v4 - Minimal, Safe Approach
// Only intercepts what's necessary, doesn't break existing functionality

(function() {
  'use strict';
  
  console.log('[XHR Polyfill v4] 🚀 Installing minimal polyfill...');
  
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
      
      console.log(`[XHR Polyfill v4] 📋 ${state.method} ${state.url}`);
      
      // Call original
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send to potentially intercept
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      // Only intercept HEAD requests for game data files
      if (state.method === 'HEAD' && isGameFile && isDataFile) {
        console.log(`[XHR Polyfill v4] ⚡ Simulating HEAD for ${state.url}`);
        
        // Simulate successful HEAD response
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
        
        return; // Don't call original send
      }
      
      // For everything else, use original XHR
      console.log(`[XHR Polyfill v4] ➡️ Passing through ${state.method} ${state.url}`);
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
  
  console.log('[XHR Polyfill v4] ✅ Installed successfully');
  console.log('[XHR Polyfill v4] 📝 Only HEAD requests for game files will be intercepted');
  console.log('[XHR Polyfill v4] 📝 All other requests use native XHR');
})();
