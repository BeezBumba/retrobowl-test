// XHR Interceptor v2 - With Full Logging
(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] 🔧 Installing...');
  console.log('[XHR Interceptor v2] 📡 navigator.onLine:', navigator.onLine);
  
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
      
      if (isGameFile) {
        console.log(`[XHR Interceptor v2] 📋 ${method} ${url} (isGameFile: ${isGameFile})`);
      }
      
      return originalOpen.apply(this, [m, u, ...args]);
    };
    
    const originalSend = xhr.send;
    xhr.send = function(body) {
      
      // HEAD: always intercept
      if (isGameFile && method === 'HEAD') {
        console.log(`[XHR Interceptor v2] ✅ Intercepting HEAD: ${url}`);
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
      
      // GET: ALWAYS intercept for game files (navigator.onLine is unreliable)
      if (isGameFile && method === 'GET') {
        console.log(`[XHR Interceptor v2] ✅ Intercepting GET: ${url} (online: ${navigator.onLine})`);
        const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
        
        fetch(absUrl)
        .then(r => {
          console.log(`[XHR Interceptor v2] 📥 Fetch response for ${url}: ${r.status}`);
          if (r.status === 404) {
            return Promise.resolve({ status: 404, text: '' });
          }
          return r.text().then(text => ({ status: r.status, text: text }));
        })
        .then(result => {
          console.log(`[XHR Interceptor v2] ✅ Got text for ${url}: ${result.text.length} bytes (status: ${result.status})`);
          Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
          Object.defineProperty(xhr, 'status', { writable: true, value: result.status });
          Object.defineProperty(xhr, 'statusText', { writable: true, value: result.status === 404 ? 'Not Found' : 'OK' });
          Object.defineProperty(xhr, 'responseText', { writable: true, value: result.text });
          Object.defineProperty(xhr, 'response', { writable: true, value: result.text });
          
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload(new Event('load'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        })
        .catch(err => {
          console.error(`[XHR Interceptor v2] ❌ Fetch failed for ${url}:`, err);
          Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
          Object.defineProperty(xhr, 'status', { writable: true, value: 0 });
          
          if (xhr.onerror) xhr.onerror(new Event('error'));
          if (xhr.onloadend) xhr.onloadend(new Event('loadend'));
        });
        return;
      }
      
      if (isGameFile) {
        console.log(`[XHR Interceptor v2] ➡️ Passing through: ${method} ${url}`);
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
  
  console.log('[XHR Interceptor v2] ✅ Installed (HEAD always, GET always with logging)');
})();
