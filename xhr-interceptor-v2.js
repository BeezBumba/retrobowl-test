// XHR Interceptor v3 for Offline HEAD Request Handling
// Enhanced with debug logging to diagnose interception issues

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v3] 🔧 Installing...');
  console.log('[XHR Interceptor v3] 📡 navigator.onLine:', navigator.onLine);
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a custom XMLHttpRequest class
  function CustomXHR() {
    const xhr = new OriginalXHR();
    const state = {
      method: '',
      url: '',
      isGameFile: false,
      async: true
    };
    
    // Override the open method to capture request details
    const originalOpen = xhr.open;
    xhr.open = function(m, u, isAsync, ...args) {
      state.method = (m || '').toUpperCase();
      state.url = u || '';
      state.async = isAsync !== false;
      
      // Check if this is a HEAD request for a game file
      const isHead = state.method === 'HEAD';
      const isHtml5game = state.url.includes('/html5game/');
      const isTxtOrIni = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      state.isGameFile = isHead && isHtml5game && isTxtOrIni;
      
      console.log(`[XHR Interceptor v3] 📋 open() called:`, {
        method: state.method,
        url: state.url,
        isHead,
        isHtml5game,
        isTxtOrIni,
        isGameFile: state.isGameFile,
        online: navigator.onLine
      });
      
      // Call the original open method
      return originalOpen.apply(this, [m, u, isAsync, ...args]);
    };
    
    // Override the send method to handle the intercepted requests
    const originalSend = xhr.send;
    xhr.send = function(body) {
      console.log(`[XHR Interceptor v3] 📤 send() called:`, {
        method: state.method,
        url: state.url,
        isGameFile: state.isGameFile,
        online: navigator.onLine
      });
      
      if (state.isGameFile && !navigator.onLine) {
        console.log(`[XHR Interceptor v3] ✅ INTERCEPTING offline HEAD request: ${state.url}`);
        
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
        Object.defineProperty(xhr, 'responseURL', { 
          get: function() { return state.url; },
          configurable: true 
        });
        
        // Trigger events asynchronously to simulate real XHR behavior
        setTimeout(() => {
          console.log(`[XHR Interceptor v3] 🎉 Firing success events for: ${state.url}`);
          
          // Fire readystatechange events
          if (xhr.onreadystatechange) {
            try {
              xhr.onreadystatechange();
            } catch (e) {
              console.error('[XHR Interceptor v3] ❌ Error in onreadystatechange:', e);
            }
          }
          
          // Fire load event
          if (xhr.onload) {
            try {
              const event = new Event('load');
              xhr.onload(event);
            } catch (e) {
              console.error('[XHR Interceptor v3] ❌ Error in onload:', e);
            }
          }
          
          // Fire loadend event
          if (xhr.onloadend) {
            try {
              const event = new Event('loadend');
              xhr.onloadend(event);
            } catch (e) {
              console.error('[XHR Interceptor v3] ❌ Error in onloadend:', e);
            }
          }
        }, 0);
        
        console.log(`[XHR Interceptor v3] 🛑 NOT calling originalSend - request blocked`);
        return; // Don't call the original send
      }
      
      console.log(`[XHR Interceptor v3] ➡️ Passing through to originalSend`);
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
  
  console.log('[XHR Interceptor v3] ✅ Installed successfully');
  console.log('[XHR Interceptor v3] 🔍 Waiting for XHR requests...');
})();
