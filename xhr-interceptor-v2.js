// XHR Interceptor v2 - Simple and clean
(function() {
  'use strict';
  
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
      // HEAD: fake success
      if (isGameFile && method === 'HEAD') {
        Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
        Object.defineProperty(xhr, 'status', { get: () => 200, configurable: true });
        Object.defineProperty(xhr, 'statusText', { get: () => 'OK', configurable: true });
        setTimeout(() => {
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        }, 0);
        return;
      }
      
      // GET: use fetch
      if (isGameFile && method === 'GET') {
        const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
        fetch(absUrl).then(r => r.text().then(t => ({s: r.status, st: r.statusText, t, u: r.url})))
        .then(d => {
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => d.s, configurable: true });
          Object.defineProperty(xhr, 'statusText', { get: () => d.st, configurable: true });
          Object.defineProperty(xhr, 'responseText', { get: () => d.t, configurable: true });
          Object.defineProperty(xhr, 'response', { get: () => d.t, configurable: true });
          Object.defineProperty(xhr, 'responseURL', { get: () => d.u, configurable: true });
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(() => {
          Object.defineProperty(xhr, 'readyState', { get: () => 4, configurable: true });
          Object.defineProperty(xhr, 'status', { get: () => 0, configurable: true });
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
  
  console.log('[XHR Interceptor v2] ✅ Installed');
})();
