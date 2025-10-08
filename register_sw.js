if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('Service Worker registered ✅', reg);
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          console.log('New Service Worker found, installing...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New Service Worker installed, update available');
                // Optionally notify user about update
                if (confirm('A new version is available. Refresh to update?')) {
                  window.location.reload();
                }
              } else {
                // First time installation
                console.log('Service Worker installed for the first time');
              }
            }
          });
        });
      })
      .catch(err => {
        console.error('Service Worker registration failed ❌', err);
      });
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('Message from Service Worker:', event.data);
    });
    
    // Check if we're online/offline
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
    });
  });
} else {
  console.warn('Service Workers are not supported in this browser');
}
