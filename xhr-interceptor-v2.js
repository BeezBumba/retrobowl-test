// XHR Interceptor v2 for Offline HEAD Request Handling
// This script intercepts XMLHttpRequest HEAD requests for game files
// and prevents them from being sent when offline

(function() {
  'use strict';
  
  console.log('[XHR Interceptor] 🔧 Installing HEAD request interceptor v2...');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a custom XMLHttpRequest class
  function CustomXHR() {
    const xhr = new OriginalXHR();
    let method = '';
    let url = '';
    let isGameFile = false;
    let async = true;
    
    // Override the open method to capture request details
    const originalOpen = xhr.open;
    xhr.open = function(m, u, isAsync, ...args) {
      method = m.toUpperCase();
      url = u;
      async = isAsync !== false;
      
      // Check if this is a HEAD request for a game file
      isGameFile = method === 'HEAD' && 
                   (url.includes('/html5game/') && 
                    (url.endsWith('.txt') || url.endsWith('.ini')));
      
      if (isGameFile) {
        console.log(`[XHR Interceptor] 🎯 Detected HEAD request: ${url}`);
      }
      
      // Call the original open method
      return originalOpen.apply(this, [m, u, isAsync, ...args]);
    };
    
    // Override the send method to handle the intercepted requests
    const originalSend = xhr.send;
    xhr.send = function(body) {
      if (isGameFile && !navigator.onLine) {
        console.log(`[XHR Interceptor] ✅ Blocking offline HEAD request: ${url}`);
        
        // Don't send the request at all - simulate success immediately
        // Set up the XHR object to look like it succeeded
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
        
        // Trigger events asynchronously to simulate real XHR behavior
        setTimeout(() => {
          console.log(`[XHR Interceptor] 📤 Firing success events for: ${url}`);
          
          // Fire readystatechange events
          if (xhr.onreadystatechange) {
            try {
              xhr.onreadystatechange();
            } catch (e) {
              console.error('[XHR Interceptor] Error in onreadystatechange:', e);
            }
          }
          
          // Fire load event
          if (xhr.onload) {
            try {
              const event = new Event('load');
              xhr.onload(event);
            } catch (e) {
              console.error('[XHR Interceptor] Error in onload:', e);
            }
          }
          
          // Fire loadend event
          if (xhr.onloadend) {
            try {
              const event = new Event('loadend');
              xhr.onloadend(event);
            } catch (e) {
              console.error('[XHR Interceptor] Error in onloadend:', e);
            }
          }
        }, 0);
        
        return; // Don't call the original send
      }
      
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
  
  console.log('[XHR Interceptor] ✅ HEAD request interceptor v2 installed');
  console.log('[XHR Interceptor] 📡 Online status:', navigator.onLine);
})();
