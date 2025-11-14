// XHR Interceptor for Offline HEAD Request Handling
// This script intercepts XMLHttpRequest HEAD requests for game files
// and returns success immediately when offline, allowing the game to proceed

(function() {
  'use strict';
  
  console.log('[XHR Interceptor] 🔧 Installing HEAD request interceptor...');
  
  // Store the original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a custom XMLHttpRequest class
  function CustomXHR() {
    const xhr = new OriginalXHR();
    let method = '';
    let url = '';
    let isGameFile = false;
    
    // Override the open method to capture request details
    const originalOpen = xhr.open;
    xhr.open = function(m, u, ...args) {
      method = m.toUpperCase();
      url = u;
      
      // Check if this is a HEAD request for a game file
      isGameFile = method === 'HEAD' && 
                   (url.includes('/html5game/') && 
                    (url.endsWith('.txt') || url.endsWith('.ini')));
      
      if (isGameFile) {
        console.log(`[XHR Interceptor] 🎯 Intercepted HEAD request: ${url}`);
      }
      
      // Call the original open method
      return originalOpen.apply(this, [m, u, ...args]);
    };
    
    // Override the send method to handle the intercepted requests
    const originalSend = xhr.send;
    xhr.send = function(...args) {
      if (isGameFile && !navigator.onLine) {
        console.log(`[XHR Interceptor] ✅ Faking success for offline HEAD: ${url}`);
        
        // Simulate a successful response
        Object.defineProperty(xhr, 'status', { value: 200, writable: false });
        Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false });
        Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
        Object.defineProperty(xhr, 'responseText', { value: '', writable: false });
        
        // Trigger the load event asynchronously
        setTimeout(() => {
          if (xhr.onload) xhr.onload();
          if (xhr.onreadystatechange) xhr.onreadystatechange();
        }, 0);
        
        return;
      }
      
      // For all other requests, use the original send
      return originalSend.apply(this, args);
    };
    
    return xhr;
  }
  
  // Copy all static properties from the original XMLHttpRequest
  Object.setPrototypeOf(CustomXHR.prototype, OriginalXHR.prototype);
  Object.setPrototypeOf(CustomXHR, OriginalXHR);
  
  // Replace the global XMLHttpRequest with our custom version
  window.XMLHttpRequest = CustomXHR;
  
  console.log('[XHR Interceptor] ✅ HEAD request interceptor installed');
})();
