// XHR Interceptor v2 FINAL - Handles both HEAD and GET requests
// This ensures game files are properly loaded through the service worker

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] 🔧 Installing FINAL version...');
  console.log('[XHR Interceptor v2] 📡 navigator.onLine:', navigator.onLine);
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a custom XMLHttpRequest class
  function CustomXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      isGameFile: false,
      async: true,
      headers: {}
    };
    
    // Override the open method to capture request details
    const originalOpen = xhr.open;
    xhr.open = function(m, u, isAsync, ...args) {
      state.method = (m || '').toUpperCase();
      state.url = u || '';
      state.async = isAsync !== false;
      
      // Check if this is a request for a game file
      const isHtml5game = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isTxtOrIni = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      state.isGameFile = isHtml5game && isTxtOrIni;
      
      console.log(`[XHR Interceptor v2] 📋 open():`, {
        method: state.method,
        url: state.url,
        isGameFile: state.isGameFile
      });
      
      // Call the original open method
      return originalOpen.apply(this, [m, u, isAsync, ...args]);
    };
    
    // Override setRequestHeader to capture headers
    const originalSetRequestHeader = xhr.setRequestHeader;
    xhr.setRequestHeader = function(header, value) {
      state.headers[header] = value;
      return originalSetRequestHeader.apply(this, [header, value]);
    };
    
    // Override the send method to handle the intercepted requests
    const originalSend = xhr.send;
    xhr.send = function(body) {
      console.log(`[XHR Interceptor v2] 📤 send():`, {
        method: state.method,
        url: state.url,
        isGameFile: state.isGameFile
      });
      
      // Intercept HEAD requests for game files
      if (state.isGameFile && state.method === 'HEAD') {
        console.log(`[XHR Interceptor v2] ✅ INTERCEPTING HEAD request: ${state.url}`);
        
        // Return success immediately for HEAD requests
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
        Object.defineProperty(xhr, 'responseText', { 
          get: function() { return ''; },
          configurable: true 
        });
        Object.defineProperty(xhr, 'response', { 
          get: function() { return ''; },
          configurable: true 
        });
        
        setTimeout(() => {
          console.log(`[XHR Interceptor v2] 🎉 Firing HEAD success events for: ${state.url}`);
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        
        return; // Don't call originalSend
      }
      
      // Intercept GET requests for game files and use Fetch API
      if (state.isGameFile && state.method === 'GET') {
        console.log(`[XHR Interceptor v2] ✅ INTERCEPTING GET request: ${state.url}`);
        
        // Use Fetch API to properly trigger service worker
        fetch(state.url, {
          method: 'GET',
          headers: state.headers
        })
        .then(response => {
          console.log(`[XHR Interceptor v2] 📥 Fetch response:`, {
            url: state.url,
            status: response.status,
            ok: response.ok
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          return response.text();
        })
        .then(text => {
          console.log(`[XHR Interceptor v2] ✅ GET success: ${state.url} (${text.length} bytes)`);
          
          // Set up XHR to look like it succeeded
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
          Object.defineProperty(xhr, 'responseText', { 
            get: function() { return text; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'response', { 
            get: function() { return text; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'responseURL', { 
            get: function() { return state.url; },
            configurable: true 
          });
          
          // Fire success events
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(error => {
          console.error(`[XHR Interceptor v2] ❌ GET failed: ${state.url}`, error);
          
          // Set up XHR to look like it failed
          Object.defineProperty(xhr, 'readyState', { 
            get: function() { return 4; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'status', { 
            get: function() { return 0; },
            configurable: true 
          });
          Object.defineProperty(xhr, 'statusText', { 
            get: function() { return ''; },
            configurable: true 
          });
          
          // Fire error events
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        
        return; // Don't call originalSend
      }
      
      console.log(`[XHR Interceptor v2] ➡️ Passing through to originalSend`);
      // For all other requests, use the original send
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  }
  
  // Copy all static properties and constants from the original XMLHttpRequest
  CustomXHR.UNSENT = OriginalXHR.UNSENT;
  CustomXHR.OPENED = OriginalXHR.OPENED;
  CustomXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  CustomXHR.LOADING = OriginalXHR.LOADING;
  CustomXHR.DONE = OriginalXHR.DONE;
  
  // Set up prototype chain
  Object.setPrototypeOf(CustomXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(CustomXHR, OriginalXHR);
  
  // Replace the global XMLHttpRequest with our custom version
  window.XMLHttpRequest = CustomXHR;
  
  console.log('[XHR Interceptor v2] ✅ FINAL version installed successfully');
})();
