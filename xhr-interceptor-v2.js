// XHR Interceptor v2 - HEAD=404, GET=fetch()
// HEAD returns 404 to prevent timing issues
// GET uses fetch() to trigger service worker

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] Installing...');
  
  const OriginalXHR = window.XMLHttpRequest;
  
  function CustomXHR() {
    const xhr = new OriginalXHR();
    let method = '', url = '', isGameFile = false;
    
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
      
      // HEAD: return 404 (prevents timing issues where game uses data before GET completes)
      if (isGameFile && method === 'HEAD') {
        Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
        Object.defineProperty(xhr, 'status', { get: () => 404, configurable: true });
        Object.defineProperty(xhr, 'statusText', { get: () => 'Not Found', configurable: true });
        setTimeout(() => {
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        return;
      }
      
      // GET: use fetch() to trigger service worker
      if (isGameFile && method === 'GET') {
        const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
        
        fetch(absUrl, { method: 'GET', credentials: 'same-origin' })
        .then(response => response.text().then(text => ({
          status: response.status,
          statusText: response.statusText,
          text: text,
          url: response.url
        })))
        .then(result => {
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => result.status, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => result.statusText, configurable: true });
          Object.defineProperty(xhr, 'responseText', { get: () => result.text, configurable: true });
          Object.defineProperty(xhr, 'response', { get: () => result.text, configurable: true });
          Object.defineProperty(xhr, 'responseURL', { get: () => result.url, configurable: true });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(error => {
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => 0, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => '', configurable: true });
          
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        return;
      }
      
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
  
  console.log('[XHR Interceptor v2] Installed (HEAD=404, GET=fetch)');
})();

