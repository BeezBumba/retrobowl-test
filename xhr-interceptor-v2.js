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
      
      // GET requests pass through normally - service worker will handle them
      // Only HEAD requests are intercepted above
      
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
