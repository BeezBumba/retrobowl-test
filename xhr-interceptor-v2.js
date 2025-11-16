// XHR Interceptor v2 - Fixed circular reference
(function() {
  'use strict';
  
  console.log('[XHR Interceptor v2] Installing...');
  
  const OriginalXHR = window.XMLHttpRequest;
  
  function CustomXHR() {
    const realXHR = new OriginalXHR();
    let method = '', url = '', isGameFile = false;
    let interceptedReadyState = 0, interceptedStatus = 0, interceptedStatusText = '';
    let interceptedResponseText = '', interceptedResponse = '', interceptedResponseURL = '';
    
    // Store original property descriptors
    const originalReadyState = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'readyState');
    const originalStatus = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'status');
    const originalStatusText = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'statusText');
    const originalResponseText = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText');
    const originalResponse = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
    const originalResponseURL = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseURL');
    
    // Event handlers
    const handlers = {
      onreadystatechange: null,
      onload: null,
      onloadend: null,
      onerror: null
    };
    
    const originalOpen = realXHR.open;
    realXHR.open = function(m, u, ...args) {
      method = (m || '').toUpperCase();
      url = u || '';
      isGameFile = (url.includes('/html5game/') || url.startsWith('html5game/')) && 
                   (url.endsWith('.txt') || url.endsWith('.ini'));
      interceptedReadyState = 1;
      return originalOpen.apply(this, [m, u, ...args]);
    };
    
    const originalSend = realXHR.send;
    realXHR.send = function(body) {
      
      if (!isGameFile) {
        return originalSend.apply(this, [body]);
      }
      
      // For game files, use fetch
      const absUrl = url.startsWith('http') ? url : new URL(url, location.href).href;
      
      interceptedReadyState = 2;
      if (handlers.onreadystatechange) handlers.onreadystatechange.call(realXHR);
      
      fetch(absUrl, { method: method, credentials: 'same-origin' })
      .then(resp => {
        interceptedStatus = resp.status;
        interceptedStatusText = resp.statusText;
        interceptedResponseURL = resp.url;
        interceptedReadyState = 3;
        if (handlers.onreadystatechange) handlers.onreadystatechange.call(realXHR);
        
        if (method === 'HEAD') {
          return '';
        }
        return resp.text();
      })
      .then(text => {
        interceptedResponseText = text;
        interceptedResponse = text;
        interceptedReadyState = 4;
        
        if (handlers.onreadystatechange) handlers.onreadystatechange.call(realXHR);
        if (handlers.onload) handlers.onload.call(realXHR, new Event('load'));
        if (handlers.onloadend) handlers.onloadend.call(realXHR, new Event('loadend'));
      })
      .catch(err => {
        interceptedStatus = 0;
        interceptedStatusText = '';
        interceptedReadyState = 4;
        
        if (handlers.onerror) handlers.onerror.call(realXHR, new Event('error'));
        if (handlers.onloadend) handlers.onloadend.call(realXHR, new Event('loadend'));
      });
    };
    
    // Override event handlers
    Object.defineProperty(realXHR, 'onreadystatechange', {
      get: () => handlers.onreadystatechange,
      set: (v) => { handlers.onreadystatechange = v; }
    });
    Object.defineProperty(realXHR, 'onload', {
      get: () => handlers.onload,
      set: (v) => { handlers.onload = v; }
    });
    Object.defineProperty(realXHR, 'onloadend', {
      get: () => handlers.onloadend,
      set: (v) => { handlers.onloadend = v; }
    });
    Object.defineProperty(realXHR, 'onerror', {
      get: () => handlers.onerror,
      set: (v) => { handlers.onerror = v; }
    });
    
    // Override response properties
    Object.defineProperty(realXHR, 'readyState', {
      get: () => isGameFile ? interceptedReadyState : originalReadyState.get.call(realXHR)
    });
    Object.defineProperty(realXHR, 'status', {
      get: () => isGameFile ? interceptedStatus : originalStatus.get.call(realXHR)
    });
    Object.defineProperty(realXHR, 'statusText', {
      get: () => isGameFile ? interceptedStatusText : originalStatusText.get.call(realXHR)
    });
    Object.defineProperty(realXHR, 'responseText', {
      get: () => isGameFile ? interceptedResponseText : originalResponseText.get.call(realXHR)
    });
    Object.defineProperty(realXHR, 'response', {
      get: () => isGameFile ? interceptedResponse : originalResponse.get.call(realXHR)
    });
    Object.defineProperty(realXHR, 'responseURL', {
      get: () => isGameFile ? interceptedResponseURL : originalResponseURL.get.call(realXHR)
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
