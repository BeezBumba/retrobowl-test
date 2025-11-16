// XHR Interceptor v2 - HEAD always, GET only when offline
(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] Installing...');
  
  const OriginalXHR = window.XMLHttpRequest;
  
  window.XMLHttpRequest = function() {
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
      
      // HEAD: always intercept
      if (isGameFile && method === 'HEAD') {
        Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
        Object.defineProperty(xhr, 'status', { writable: true, value: 200 });
        Object.defineProperty(xhr, 'statusText', { writable: true, value: 'OK' });
        setTimeout(() => {
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        return;
      }
      
      // GET: only intercept when offline
      if (isGameFile && method === 'GET' && !navigator.onLine) {
        const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
        
        fetch(absUrl)
        .then(r => r.text())
        .then(text => {
          Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
          Object.defineProperty(xhr, 'status', { writable: true, value: 200 });
          Object.defineProperty(xhr, 'statusText', { writable: true, value: 'OK' });
          Object.defineProperty(xhr, 'responseText', { writable: true, value: text });
          Object.defineProperty(xhr, 'response', { writable: true, value: text });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(() => {
          Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
          Object.defineProperty(xhr, 'status', { writable: true, value: 0 });
          
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        return;
      }
      
      return originalSend.apply(this, [body]);
    };
    
    return xhr;
  };
  
  window.XMLHttpRequest.UNSENT = OriginalXHR.UNSENT;
  window.XMLHttpRequest.OPENED = OriginalXHR.OPENED;
  window.XMLHttpRequest.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
  window.XMLHttpRequest.LOADING = OriginalXHR.LOADING;
  window.XMLHttpRequest.DONE = OriginalXHR.DONE;
  
  console.log('[XHR Interceptor v2] ✅ Installed (HEAD always, GET when offline)');
})();
