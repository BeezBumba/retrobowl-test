// XHR Polyfill v10 - Force Async + fetch() for Game Files
// Converts synchronous XHR to asynchronous fetch() for offline compatibility
// WARNING: This changes game behavior and might cause issues!

(function() {
  'use strict';
  
  console.log('%c[XHR Polyfill v10] 🚀 Installing (Force Async Mode)...', 'color: #00ff00; font-weight: bold');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a wrapper that extends the original
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true,
      requestId: Math.random().toString(36).substr(2, 9),
      forcedAsync: false
    };
    
    // Store original methods
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // Override open to capture request details and force async
    xhr.open = function(method, url, async, ...args) {
      state.method = (method || '').toUpperCase();
      state.url = url || '';
      state.async = async !== false;
      
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      console.log(`%c[XHR v10] ${state.requestId} - OPEN: ${state.method} ${state.url}`, 'color: #ffaa00; font-weight: bold');
      console.log(`  - Original async: ${async}`);
      console.log(`  - isGameFile: ${isGameFile}, isDataFile: ${isDataFile}`);
      
      // Force async for game data files
      if (state.method === 'GET' && isGameFile && isDataFile && !state.async) {
        console.log(`%c[XHR v10] ${state.requestId} - ⚠️ FORCING ASYNC for game file!`, 'color: #ff8800; font-weight: bold');
        state.forcedAsync = true;
        async = true; // Force async
      }
      
      // Call original with potentially modified async flag
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send to use fetch() for game files
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      console.log(`%c[XHR v10] ${state.requestId} - SEND`, 'color: #ff00ff; font-weight: bold');
      
      // For GET requests to game data files, use fetch() instead
      if (state.method === 'GET' && isGameFile && isDataFile) {
        console.log(`%c[XHR v10] ${state.requestId} - 🌐 Using fetch() instead of XHR`, 'color: #00ffff; font-weight: bold');
        
        fetch(state.url)
          .then(response => {
            console.log(`%c[XHR v10] ${state.requestId} - 📥 Response: ${response.status}`, 'color: #00ff00');
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            console.log(`%c[XHR v10] ${state.requestId} - ✅ Loaded ${text.length} bytes`, 'color: #00ff00; font-weight: bold');
            
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
            
            console.log(`%c[XHR v10] ${state.requestId} - 🔔 Firing events...`, 'color: #00ff00');
            
            // Fire readystatechange events
            if (xhr.onreadystatechange) {
              // Simulate state progression
              Object.defineProperty(xhr, 'readyState', { get: () => 2, configurable: true });
              xhr.onreadystatechange();
              Object.defineProperty(xhr, 'readyState', { get: () => 3, configurable: true });
              xhr.onreadystatechange();
              Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
              xhr.onreadystatechange();
            }
            
            // Fire load event
            if (xhr.onload) {
              console.log(`  - Firing onload`);
              xhr.onload({ type: 'load', target: xhr });
            }
            
            // Fire loadend event
            if (xhr.onloadend) {
              console.log(`  - Firing onloadend`);
              xhr.onloadend({ type: 'loadend', target: xhr });
            }
            
            console.log(`%c[XHR v10] ${state.requestId} - ✅ Complete!`, 'color: #00ff00; font-weight: bold');
          })
          .catch(error => {
            console.log(`%c[XHR v10] ${state.requestId} - ❌ Error: ${error}`, 'color: #ff0000; font-weight: bold');
            
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
            if (xhr.onerror) {
              xhr.onerror({ type: 'error', target: xhr });
            }
            if (xhr.onloadend) {
              xhr.onloadend({ type: 'loadend', target: xhr });
            }
          });
        
        return; // Don't call original send
      }
      
      // For everything else, use native XHR
      console.log(`%c[XHR v10] ${state.requestId} - ➡️ Native XHR`, 'color: #888');
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
  
  console.log('%c[XHR Polyfill v10] ✅ Installed', 'color: #00ff00; font-weight: bold');
  console.log('%c[XHR Polyfill v10] ⚠️ WARNING: Forcing async mode for game files!', 'color: #ff8800; font-weight: bold');
  console.log('%c[XHR Polyfill v10] 📝 This may cause timing issues but enables offline mode', 'color: #ffaa00');
})();
