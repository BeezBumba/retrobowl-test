// XHR Polyfill v9 - DEBUG VERSION with extensive logging
// Tries native XHR first, falls back to fetch() on error

(function() {
  'use strict';
  
  console.log('%c[XHR Polyfill v9 DEBUG] 🚀 Installing...', 'color: #00ff00; font-weight: bold');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a wrapper that extends the original
  function PolyfillXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      async: true,
      usedFallback: false,
      requestId: Math.random().toString(36).substr(2, 9)
    };
    
    console.log(`%c[XHR v9] 🆕 New XHR instance created: ${state.requestId}`, 'color: #888');
    
    // Store original methods
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    const originalAddEventListener = xhr.addEventListener;
    
    // Track all event listeners
    const eventListeners = {
      load: [],
      error: [],
      loadend: [],
      readystatechange: []
    };
    
    // Override addEventListener to track listeners
    xhr.addEventListener = function(event, handler, ...args) {
      console.log(`%c[XHR v9] ${state.requestId} - addEventListener: ${event}`, 'color: #0088ff');
      if (eventListeners[event]) {
        eventListeners[event].push(handler);
      }
      return originalAddEventListener.apply(this, [event, handler, ...args]);
    };
    
    // Override open to capture request details
    xhr.open = function(method, url, async, ...args) {
      state.method = (method || '').toUpperCase();
      state.url = url || '';
      state.async = async !== false;
      
      console.log(`%c[XHR v9] ${state.requestId} - OPEN: ${state.method} ${state.url} (async: ${state.async})`, 'color: #ffaa00; font-weight: bold');
      
      // Call original
      return originalOpen.apply(this, [method, url, async, ...args]);
    };
    
    // Override send with detailed logging and fallback
    xhr.send = function(body) {
      const isGameFile = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isDataFile = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      console.log(`%c[XHR v9] ${state.requestId} - SEND called`, 'color: #ff00ff; font-weight: bold');
      console.log(`  - isGameFile: ${isGameFile}`);
      console.log(`  - isDataFile: ${isDataFile}`);
      console.log(`  - method: ${state.method}`);
      console.log(`  - url: ${state.url}`);
      
      // For GET requests to game data files, set up error handler
      if (state.method === 'GET' && isGameFile && isDataFile) {
        console.log(`%c[XHR v9] ${state.requestId} - 🎯 Target for interception!`, 'color: #00ffff; font-weight: bold');
        console.log(`  - Setting up error handlers...`);
        
        // Store original handlers
        const originalOnError = xhr.onerror;
        const originalOnLoadEnd = xhr.onloadend;
        const originalOnLoad = xhr.onload;
        
        // Set up our error handler
        xhr.onerror = function(e) {
          console.log(`%c[XHR v9] ${state.requestId} - ❌ ONERROR FIRED!`, 'color: #ff0000; font-weight: bold');
          console.log(`  - Event:`, e);
          console.log(`  - Status:`, xhr.status);
          console.log(`  - ReadyState:`, xhr.readyState);
          console.log(`  - usedFallback:`, state.usedFallback);
          
          // If native XHR failed and we haven't tried fallback yet
          if (!state.usedFallback) {
            console.log(`%c[XHR v9] ${state.requestId} - 🔄 Attempting fetch() fallback...`, 'color: #ffaa00; font-weight: bold');
            state.usedFallback = true;
            
            fetch(state.url)
              .then(response => {
                console.log(`%c[XHR v9] ${state.requestId} - 📥 fetch() response received`, 'color: #00ff00');
                console.log(`  - Status: ${response.status}`);
                console.log(`  - OK: ${response.ok}`);
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
              })
              .then(text => {
                console.log(`%c[XHR v9] ${state.requestId} - ✅ fetch() SUCCESS!`, 'color: #00ff00; font-weight: bold');
                console.log(`  - Bytes received: ${text.length}`);
                console.log(`  - First 100 chars: ${text.substring(0, 100)}`);
                
                // Set response properties
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
                  get: () => text, 
                  configurable: true,
                  enumerable: true
                });
                Object.defineProperty(xhr, 'response', { 
                  get: () => text, 
                  configurable: true,
                  enumerable: true
                });
                
                console.log(`%c[XHR v9] ${state.requestId} - 🔔 Firing success events...`, 'color: #00ff00');
                
                // Fire onload handler
                if (originalOnLoad) {
                  console.log(`  - Calling originalOnLoad`);
                  originalOnLoad.call(xhr);
                }
                
                // Fire load event listeners
                eventListeners.load.forEach((handler, i) => {
                  console.log(`  - Calling load listener ${i}`);
                  handler.call(xhr, { type: 'load', target: xhr });
                });
                
                // Fire onloadend handler
                if (originalOnLoadEnd) {
                  console.log(`  - Calling originalOnLoadEnd`);
                  originalOnLoadEnd.call(xhr);
                }
                
                // Fire loadend event listeners
                eventListeners.loadend.forEach((handler, i) => {
                  console.log(`  - Calling loadend listener ${i}`);
                  handler.call(xhr, { type: 'loadend', target: xhr });
                });
                
                console.log(`%c[XHR v9] ${state.requestId} - ✅ All events fired!`, 'color: #00ff00; font-weight: bold');
              })
              .catch(fetchError => {
                console.log(`%c[XHR v9] ${state.requestId} - ❌ fetch() FAILED!`, 'color: #ff0000; font-weight: bold');
                console.log(`  - Error:`, fetchError);
                
                // Call original error handler if it exists
                if (originalOnError) {
                  console.log(`  - Calling originalOnError`);
                  originalOnError.call(xhr, e);
                }
              });
          } else {
            console.log(`%c[XHR v9] ${state.requestId} - Already tried fallback, calling original error handler`, 'color: #ff8800');
            // Already tried fallback, call original error handler
            if (originalOnError) {
              originalOnError.call(xhr, e);
            }
          }
        };
        
        // Also listen for loadend to detect failures
        const originalLoadEndHandler = xhr.onloadend;
        xhr.onloadend = function(e) {
          console.log(`%c[XHR v9] ${state.requestId} - 🏁 ONLOADEND FIRED`, 'color: #8800ff');
          console.log(`  - Status: ${xhr.status}`);
          console.log(`  - ReadyState: ${xhr.readyState}`);
          
          // If status is 0, the request failed (likely offline)
          if (xhr.status === 0 && !state.usedFallback) {
            console.log(`%c[XHR v9] ${state.requestId} - ⚠️ Status 0 detected, triggering fallback...`, 'color: #ffaa00; font-weight: bold');
            // Trigger the error handler which will do the fallback
            if (xhr.onerror) {
              xhr.onerror({ type: 'error', target: xhr });
            }
          } else {
            // Normal completion, call original handler
            if (originalLoadEndHandler) {
              originalLoadEndHandler.call(xhr, e);
            }
          }
        };
        
        console.log(`%c[XHR v9] ${state.requestId} - ➡️ Calling native XHR send()...`, 'color: #0088ff');
        // Try native XHR first
        return originalSend.apply(this, [body]);
      }
      
      // For everything else, use native XHR
      console.log(`%c[XHR v9] ${state.requestId} - ➡️ Using native XHR (not intercepted)`, 'color: #888');
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
  
  console.log('%c[XHR Polyfill v9 DEBUG] ✅ Installed successfully', 'color: #00ff00; font-weight: bold');
  console.log('%c[XHR Polyfill v9 DEBUG] 📝 Strategy: Native XHR first, fetch() fallback on error', 'color: #00ff00');
  console.log('%c[XHR Polyfill v9 DEBUG] 🐛 Debug mode: Extensive logging enabled', 'color: #ffaa00');
})();
