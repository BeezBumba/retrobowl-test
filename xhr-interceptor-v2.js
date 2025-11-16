// XHR Interceptor v2 - Error Catching with Fetch Fallback
// Let XHR proceed normally, but catch offline errors and retry with fetch()

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] Installing error-catching version...');
  
  const OriginalXHR = window.XMLHttpRequest;
  
  function CustomXHR() {
    const xhr = new OriginalXHR();
    let method = '', url = '', isGameFile = false;
    let usedFallback = false;
    
    const originalOpen = xhr.open;
    xhr.open = function(m, u, ...args) {
      method = (m || '').toUpperCase();
      url = u || '';
      isGameFile = (url.includes('/html5game/') || url.startsWith('html5game/')) && 
                   (url.endsWith('.txt') || url.endsWith('.ini'));
      return originalOpen.apply(this, [m, u, ...args]);
    };
    
    const originalSend = xhr.send;
    xhr.send = function(body) {
      
      if (isGameFile) {
        // Store original handlers
        const originalOnError = xhr.onerror;
        const originalOnLoad = xhr.onload;
        const originalOnReadyStateChange = xhr.onreadystatechange;
        
        // Intercept error handler to catch offline failures
        xhr.onerror = function(event) {
          console.log(`[XHR Interceptor v2] ⚠️ XHR error for ${url}, trying fetch fallback...`);
          
          // Don't retry if we already used fallback
          if (usedFallback) {
            if (originalOnError) originalOnError.call(xhr, event);
            return;
          }
          
          usedFallback = true;
          const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
          
          // Try fetch as fallback
          fetch(absUrl, { method: method, credentials: 'same-origin' })
          .then(response => {
            if (method === 'HEAD') {
              // For HEAD, just fire success
              Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
              Object.defineProperty(xhr, 'status', { get: () => response.status, configurable: true });
              Object.defineProperty(xhr, 'statusText', { get: () => response.statusText, configurable: true });
              
              if (originalOnReadyStateChange) originalOnReadyStateChange.call(xhr);
              if (originalOnLoad) originalOnLoad.call(xhr, new Event('load'));
              if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
            } else {
              // For GET, get the text content
              return response.text().then(text => {
                Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
                Object.defineProperty(xhr, 'status', { get: () => response.status, configurable: true });
                Object.defineProperty(xhr, 'statusText', { get: () => response.statusText, configurable: true });
                Object.defineProperty(xhr, 'responseText', { get: () => text, configurable: true });
                Object.defineProperty(xhr, 'response', { get: () => text, configurable: true });
                Object.defineProperty(xhr, 'responseURL', { get: () => response.url, configurable: true });
                
                console.log(`[XHR Interceptor v2] ✅ Fetch fallback succeeded for ${url}`);
                
                if (originalOnReadyStateChange) originalOnReadyStateChange.call(xhr);
                if (originalOnLoad) originalOnLoad.call(xhr, new Event('load'));
                if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
              });
            }
          })
          .catch(fetchError => {
            console.error(`[XHR Interceptor v2] ❌ Fetch fallback also failed for ${url}`, fetchError);
            // Call original error handler
            if (originalOnError) originalOnError.call(xhr, event);
          });
        };
      }
      
      // Always call original send
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  }
  
  CustomXHR.UNSENT = OriginalXHR.UNSENT;
  CustomXHR.OPENED = OriginalXHR.OPENED;
  CustomXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  CustomXHR.LOADING = OriginalXHR.LOADING;
  CustomXHR.DONE = OriginalXHR.DONE;
  Object.setPrototypeOf(CustomXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(CustomXHR, OriginalXHR);
  window.XMLHttpRequest = CustomXHR;
  
  console.log('[XHR Interceptor v2] ✅ Error-catching version installed');
})();
