// XHR Interceptor v2 SMART - Conditional GET interception
// - HEAD requests: Always intercepted
// - GET requests: Only intercepted when OFFLINE (to prevent error spam)

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] 🔧 Installing SMART version...');
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
      async: true
    };
    
    // Override the open method to capture request details
    const originalOpen = xhr.open;
    xhr.open = function(m, u, isAsync, ...args) {
      state.method = (m || '').toUpperCase();
      state.url = u || '';
      state.async = isAsync !== false;
      
      // Check if this is a game file request
      const isHtml5game = state.url.includes('/html5game/') || state.url.startsWith('html5game/');
      const isTxtOrIni = state.url.endsWith('.txt') || state.url.endsWith('.ini');
      
      state.isGameFile = isHtml5game && isTxtOrIni;
      
      // Call the original open method
      return originalOpen.apply(this, [m, u, isAsync, ...args]);
    };
    
    // Override the send method to handle the intercepted requests
    const originalSend = xhr.send;
    xhr.send = function(body) {
      const isOffline = !navigator.onLine;
      
      // ALWAYS intercept HEAD requests for game files
      if (state.isGameFile && state.method === 'HEAD') {
        console.log(`[XHR Interceptor v2] 🎯 Intercepting HEAD: ${state.url}`);
        
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
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        
        return; // Don't call originalSend
      }
      
      // ONLY intercept GET requests when OFFLINE (to prevent error spam)
      if (state.isGameFile && state.method === 'GET' && isOffline) {
        console.log(`[XHR Interceptor v2] 📥 Intercepting GET (OFFLINE): ${state.url}`);
        
        // Convert to absolute URL
        const absoluteUrl = state.url.startsWith('http') ? state.url : 
                           new URL(state.url, window.location.href).href;
        
        // Use fetch() to trigger service worker
        fetch(absoluteUrl, { method: 'GET', credentials: 'same-origin' })
        .then(response => response.text().then(text => ({ status: response.status, statusText: response.statusText, text })))
        .then(({ status, statusText, text }) => {
          // Simulate successful XHR
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => status, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => statusText, configurable: true });
          Object.defineProperty(xhr, 'responseText', { get: () => text, configurable: true });
          Object.defineProperty(xhr, 'response', { get: () => text, configurable: true });
          Object.defineProperty(xhr, 'responseURL', { get: () => absoluteUrl, configurable: true });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(error => {
          console.error(`[XHR Interceptor v2] ❌ Fetch failed: ${state.url}`, error);
          
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => 0, configurable: true });
          
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        
        return; // Don't call originalSend
      }
      
      // For all other requests (including GET when ONLINE), pass through
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  }
  
  // Copy all static properties and constants
  CustomXHR.UNSENT = OriginalXHR.UNSENT;
  CustomXHR.OPENED = OriginalXHR.OPENED;
  CustomXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  CustomXHR.LOADING = OriginalXHR.LOADING;
  CustomXHR.DONE = OriginalXHR.DONE;
  
  // Set up prototype chain
  Object.setPrototypeOf(CustomXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(CustomXHR, OriginalXHR);
  
  // Replace the global XMLHttpRequest
  window.XMLHttpRequest = CustomXHR;
  
  console.log('[XHR Interceptor v2] ✅ SMART version installed');
})();
