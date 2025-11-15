// XHR Interceptor for Retro Bowl PWA Offline Support
// Intercepts HEAD and GET requests for game files to enable offline functionality

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] 🔧 Installing...');
  
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  // Store request state
  const requestStates = new WeakMap();
  
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Detect if this is a game file request
    const isHtml5game = url.includes('/html5game/') || url.startsWith('html5game/');
    const isTxtOrIni = url.endsWith('.txt') || url.endsWith('.ini');
    const isGameFile = isHtml5game && isTxtOrIni;
    
    // Store state for this XHR object
    requestStates.set(this, {
      method: method.toUpperCase(),
      url: url,
      isGameFile: isGameFile
    });
    
    // Call original open
    return originalOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    const state = requestStates.get(this) || {};
    
    // Only intercept game file requests
    if (state.isGameFile) {
      
      // INTERCEPT HEAD REQUESTS
      if (state.method === 'HEAD') {
        console.log(`[XHR Interceptor v2] 🎯 Intercepting HEAD: ${state.url}`);
        
        // Fake a successful HEAD response
        setTimeout(() => {
          Object.defineProperty(xhr, 'readyState', { 
            get: function() { return 4; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'status', { 
            get: function() { return 200; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'statusText', { 
            get: function() { return 'OK'; },
            configurable: true 
          });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        
        return; // Don't call originalSend
      }
      
      // INTERCEPT GET REQUESTS - Use fetch() to trigger service worker
      if (state.method === 'GET') {
        console.log(`[XHR Interceptor v2] 📥 Intercepting GET: ${state.url}`);
        
        // Convert relative URL to absolute if needed
        const absoluteUrl = state.url.startsWith('http') ? state.url : 
                           new URL(state.url, window.location.href).href;
        
        // Use fetch() which properly triggers service worker
        fetch(absoluteUrl, {
          method: 'GET',
          credentials: 'same-origin'
        })
        .then(response => {
          console.log(`[XHR Interceptor v2] ✅ Fetch response: ${state.url} (${response.status})`);
          
          // Get response text
          return response.text().then(text => ({
            status: response.status,
            statusText: response.statusText,
            text: text
          }));
        })
        .then(({ status, statusText, text }) => {
          // Simulate XHR completion
          Object.defineProperty(xhr, 'readyState', { 
            get: function() { return 4; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'status', { 
            get: function() { return status; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'statusText', { 
            get: function() { return statusText; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'responseText', { 
            get: function() { return text; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'response', { 
            get: function() { return text; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'responseURL', { 
            get: function() { return absoluteUrl; },
            configurable: true 
          });
          
          // Fire events
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(error => {
          console.error(`[XHR Interceptor v2] ❌ Fetch failed: ${state.url}`, error);
          
          // Simulate XHR error
          Object.defineProperty(xhr, 'readyState', { 
            get: function() { return 4; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'status', { 
            get: function() { return 0; },
            configurable: true 
          });
          
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        
        return; // Don't call originalSend
      }
    }
    
    // For all other requests, use original send
    return originalSend.apply(this, [body]);
  };
  
  console.log('[XHR Interceptor v2] ✅ Installed successfully');
  
})();
