\// XHR Interceptor v2 - Proper XHR Mimicking
// Block send() and use fetch(), but carefully mimic ALL XHR behavior

(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] Installing...');
  
  const OriginalXHR = window.XMLHttpRequest;
  
  function CustomXHR() {
    const realXHR = new OriginalXHR();
    let method = '', url = '', isGameFile = false;
    let readyState = 0, status = 0, statusText = '', responseText = '', response = '', responseURL = '';
    
    // Internal state
    const state = {
      onreadystatechange: null,
      onload: null,
      onloadend: null,
      onerror: null,
      onprogress: null,
      ontimeout: null,
      onabort: null
    };
    
    const originalOpen = realXHR.open;
    realXHR.open = function(m, u, ...args) {
      method = (m || '').toUpperCase();
      url = u || '';
      isGameFile = (url.includes('/html5game/') || url.startsWith('html5game/')) && 
                   (url.endsWith('.txt') || url.endsWith('.ini'));
      readyState = 1;
      return originalOpen.apply(this, [m, u, ...args]);
    };
    
    const originalSend = realXHR.send;
    realXHR.send = function(body) {
      
      if (!isGameFile) {
        return originalSend.apply(this, [body]);
      }
      
      // For game files, use fetch instead of XHR
      const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
      
      // Set loading state
      readyState = 2;
      if (state.onreadystatechange) state.onreadystatechange.call(realXHR);
      
      fetch(absUrl, { method: method, credentials: 'same-origin' })
      .then(resp => {
        status = resp.status;
        statusText = resp.statusText;
        responseURL = resp.url;
        readyState = 3;
        if (state.onreadystatechange) state.onreadystatechange.call(realXHR);
        
        if (method === 'HEAD') {
          return Promise.resolve('');
        }
        return resp.text();
      })
      .then(text => {
        responseText = text;
        response = text;
        readyState = 4;
        
        // Fire all success events
        if (state.onreadystatechange) state.onreadystatechange.call(realXHR);
        if (state.onload) state.onload.call(realXHR, new Event('load'));
        if (state.onloadend) state.onloadend.call(realXHR, new Event('loadend'));
      })
      .catch(err => {
        status = 0;
        statusText = '';
        readyState = 4;
        
        if (state.onerror) state.onerror.call(realXHR, new Event('error'));
        if (state.onloadend) state.onloadend.call(realXHR, new Event('loadend'));
      });
    };
    
    // Override all event handlers to use our state
    Object.defineProperty(realXHR, 'onreadystatechange', {
      get: () => state.onreadystatechange,
      set: (v) => { state.onreadystatechange = v; },
      configurable: true
    });
    Object.defineProperty(realXHR, 'onload', {
      get: () => state.onload,
      set: (v) => { state.onload = v; },
      configurable: true
    });
    Object.defineProperty(realXHR, 'onloadend', {
      get: () => state.onloadend,
      set: (v) => { state.onloadend = v; },
      configurable: true
    });
    Object.defineProperty(realXHR, 'onerror', {
      get: () => state.onerror,
      set: (v) => { state.onerror = v; },
      configurable: true
    });
    
    // Override response properties
    Object.defineProperty(realXHR, 'readyState', {
      get: () => isGameFile ? readyState : realXHR.readyState,
      configurable: true
    });
    Object.defineProperty(realXHR, 'status', {
      get: () => isGameFile ? status : realXHR.status,
      configurable: true
    });
    Object.defineProperty(realXHR, 'statusText', {
      get: () => isGameFile ? statusText : realXHR.statusText,
      configurable: true
    });
    Object.defineProperty(realXHR, 'responseText', {
      get: () => isGameFile ? responseText : realXHR.responseText,
      configurable: true
    });
    Object.defineProperty(realXHR, 'response', {
      get: () => isGameFile ? response : realXHR.response,
      configurable: true
    });
    Object.defineProperty(realXHR, 'responseURL', {
      get: () => isGameFile ? responseURL : realXHR.responseURL,
      configurable: true
    });
    
    return realXHR;
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
