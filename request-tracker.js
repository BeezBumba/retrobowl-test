// Request Tracker Script for Debugging Service Worker Caching
// This script intercepts and logs all network requests made by the website and game

(function() {
    'use strict';
    
    // Storage for all tracked requests
    const trackedRequests = [];
    let requestCounter = 0;
    
    // Create UI for displaying requests
    function createUI() {
        const container = document.createElement('div');
        container.id = 'request-tracker-ui';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 500px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #333;
            border-radius: 5px;
            z-index: 10000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px;
            background: #333;
            border-bottom: 1px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span>Request Tracker</span>
            <div>
                <button id="clear-requests" style="margin-right: 5px; padding: 2px 8px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">Clear</button>
                <button id="export-requests" style="margin-right: 5px; padding: 2px 8px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">Export</button>
                <button id="toggle-tracker" style="padding: 2px 8px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">Hide</button>
            </div>
        `;
        
        const content = document.createElement('div');
        content.id = 'request-list';
        content.style.cssText = `
            padding: 10px;
            overflow-y: auto;
            max-height: 400px;
        `;
        
        container.appendChild(header);
        container.appendChild(content);
        document.body.appendChild(container);
        
        // Event listeners
        document.getElementById('clear-requests').addEventListener('click', clearRequests);
        document.getElementById('export-requests').addEventListener('click', exportRequests);
        document.getElementById('toggle-tracker').addEventListener('click', toggleTracker);
        
        return content;
    }
    
    let requestList;
    let isVisible = true;
    
    function toggleTracker() {
        const container = document.getElementById('request-tracker-ui');
        const button = document.getElementById('toggle-tracker');
        if (isVisible) {
            container.style.display = 'none';
            button.textContent = 'Show';
            isVisible = false;
        } else {
            container.style.display = 'flex';
            button.textContent = 'Hide';
            isVisible = true;
        }
    }
    
    function clearRequests() {
        trackedRequests.length = 0;
        requestCounter = 0;
        updateUI();
    }
    
    function exportRequests() {
        const data = {
            timestamp: new Date().toISOString(),
            totalRequests: trackedRequests.length,
            requests: trackedRequests
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `request-tracker-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function logRequest(method, url, type, status, cached, error) {
        const request = {
            id: ++requestCounter,
            timestamp: new Date().toISOString(),
            method: method,
            url: url,
            type: type,
            status: status,
            cached: cached,
            error: error,
            domain: new URL(url).hostname,
            path: new URL(url).pathname,
            extension: new URL(url).pathname.split('.').pop()
        };
        
        trackedRequests.push(request);
        updateUI();
        
        // Also log to console for immediate debugging
        const statusColor = error ? 'color: red' : (cached ? 'color: green' : 'color: blue');
        console.log(`%c[REQUEST ${request.id}] ${method} ${url}`, statusColor, {
            type: type,
            status: status,
            cached: cached,
            error: error
        });
    }
    
    function updateUI() {
        if (!requestList) return;
        
        const recent = trackedRequests.slice(-20); // Show last 20 requests
        requestList.innerHTML = recent.map(req => {
            const statusColor = req.error ? '#ff6b6b' : (req.cached ? '#51cf66' : '#74c0fc');
            const shortUrl = req.url.length > 50 ? '...' + req.url.slice(-47) : req.url;
            return `
                <div style="margin-bottom: 5px; padding: 3px; border-left: 3px solid ${statusColor}; background: rgba(255,255,255,0.05);">
                    <div style="font-weight: bold;">#${req.id} ${req.method} ${req.status || 'PENDING'}</div>
                    <div style="color: #ccc; word-break: break-all;">${shortUrl}</div>
                    <div style="font-size: 10px; color: #999;">
                        ${req.type} | ${req.cached ? 'CACHED' : 'NETWORK'} | ${req.timestamp.split('T')[1].split('.')[0]}
                        ${req.error ? ` | ERROR: ${req.error}` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        requestList.scrollTop = requestList.scrollHeight;
    }
    
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0] instanceof Request ? args[0].url : args[0];
        const method = args[0] instanceof Request ? args[0].method : (args[1] && args[1].method) || 'GET';
        
        logRequest(method, url, 'fetch', null, false, null);
        
        return originalFetch.apply(this, args)
            .then(response => {
                logRequest(method, url, 'fetch', response.status, false, null);
                return response;
            })
            .catch(error => {
                logRequest(method, url, 'fetch', null, false, error.message);
                throw error;
            });
    };
    
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._requestMethod = method;
        this._requestUrl = url;
        return originalXHROpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        const method = this._requestMethod || 'GET';
        const url = this._requestUrl;
        
        if (url) {
            logRequest(method, url, 'xhr', null, false, null);
            
            this.addEventListener('load', () => {
                logRequest(method, url, 'xhr', this.status, false, null);
            });
            
            this.addEventListener('error', () => {
                logRequest(method, url, 'xhr', null, false, 'Network Error');
            });
        }
        
        return originalXHRSend.apply(this, args);
    };
    
    // Track resource loading (images, scripts, stylesheets, etc.)
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (['img', 'script', 'link', 'audio', 'video', 'source', 'iframe'].includes(tagName.toLowerCase())) {
            const trackResource = (src, type) => {
                if (src && src.startsWith('http')) {
                    logRequest('GET', src, type, null, false, null);
                    
                    element.addEventListener('load', () => {
                        logRequest('GET', src, type, 200, false, null);
                    });
                    
                    element.addEventListener('error', () => {
                        logRequest('GET', src, type, null, false, 'Load Error');
                    });
                }
            };
            
            // Override src setter
            const srcDescriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'src') || 
                                 Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'src');
            if (srcDescriptor && srcDescriptor.set) {
                const originalSrcSetter = srcDescriptor.set;
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        trackResource(value, tagName.toLowerCase());
                        return originalSrcSetter.call(this, value);
                    },
                    get: srcDescriptor.get,
                    configurable: true
                });
            }
            
            // Override href setter for link elements
            if (tagName.toLowerCase() === 'link') {
                const hrefDescriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'href') || 
                                      Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'href');
                if (hrefDescriptor && hrefDescriptor.set) {
                    const originalHrefSetter = hrefDescriptor.set;
                    Object.defineProperty(element, 'href', {
                        set: function(value) {
                            trackResource(value, 'link');
                            return originalHrefSetter.call(this, value);
                        },
                        get: hrefDescriptor.get,
                        configurable: true
                    });
                }
            }
        }
        
        return element;
    };
    
    // Track service worker cache hits
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.type === 'CACHE_HIT') {
                // Update the request to show it was cached
                const cachedRequest = trackedRequests.find(req => req.url === event.data.url);
                if (cachedRequest) {
                    cachedRequest.cached = true;
                    updateUI();
                }
            }
        });
    }
    
    // Monitor existing resources on page
    function scanExistingResources() {
        // Scan images
        document.querySelectorAll('img').forEach(img => {
            if (img.src) {
                logRequest('GET', img.src, 'img', img.complete ? 200 : null, false, null);
            }
        });
        
        // Scan scripts
        document.querySelectorAll('script[src]').forEach(script => {
            logRequest('GET', script.src, 'script', 200, false, null);
        });
        
        // Scan stylesheets
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (link.href) {
                logRequest('GET', link.href, 'link', 200, false, null);
            }
        });
        
        // Scan audio/video
        document.querySelectorAll('audio, video').forEach(media => {
            if (media.src) {
                logRequest('GET', media.src, media.tagName.toLowerCase(), 200, false, null);
            }
            media.querySelectorAll('source').forEach(source => {
                if (source.src) {
                    logRequest('GET', source.src, 'source', 200, false, null);
                }
            });
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            requestList = createUI();
            scanExistingResources();
        });
    } else {
        requestList = createUI();
        scanExistingResources();
    }
    
    // Expose global functions for manual debugging
    window.requestTracker = {
        getRequests: () => trackedRequests,
        clearRequests: clearRequests,
        exportRequests: exportRequests,
        getStats: () => {
            const stats = {
                total: trackedRequests.length,
                cached: trackedRequests.filter(r => r.cached).length,
                errors: trackedRequests.filter(r => r.error).length,
                byType: {},
                byDomain: {},
                byStatus: {}
            };
            
            trackedRequests.forEach(req => {
                stats.byType[req.type] = (stats.byType[req.type] || 0) + 1;
                stats.byDomain[req.domain] = (stats.byDomain[req.domain] || 0) + 1;
                stats.byStatus[req.status || 'unknown'] = (stats.byStatus[req.status || 'unknown'] || 0) + 1;
            });
            
            return stats;
        }
    };
    
    console.log('🔍 Request Tracker initialized! Use window.requestTracker for manual debugging.');
    console.log('Available methods: getRequests(), clearRequests(), exportRequests(), getStats()');
    
})();

