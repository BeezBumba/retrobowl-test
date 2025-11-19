// XHR Polyfill v3 - Complete XMLHttpRequest replacement using fetch()
// Designed to enable offline functionality for Retro Bowl game

(function() {
  'use strict';
  
  console.log('[XHR Polyfill v3] 🚀 Installing complete XHR replacement...');
  console.log('[XHR Polyfill v3] 📡 navigator.onLine:', navigator.onLine);
  
  // Store the original XMLHttpRequest (for debugging if needed)
  const OriginalXHR = window.XMLHttpRequest;
  
  // Create a custom XMLHttpRequest class that uses fetch() internally
  class FetchBasedXHR {
    constructor() {
      // Internal state
      this._method = '';
      this._url = '';
      this._async = true;
      this._requestHeaders = {};
      this._readyState = 0; // UNSENT
      this._status = 0;
      this._statusText = '';
      this._response = null;
      this._responseText = '';
      this._responseType = '';
      this._responseURL = '';
      this._withCredentials = false;
      this._timeout = 0;
      this._aborted = false;
      
      // Event handlers
      this.onreadystatechange = null;
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      this.onloadstart = null;
      this.onloadend = null;
      this.onprogress = null;
      this.ontimeout = null;
      
      // Upload object (not fully implemented but exists)
      this.upload = {
        onprogress: null,
        onload: null,
        onerror: null
      };
      
      console.log('[XHR Polyfill v3] 🆕 New XHR instance created');
    }
    
    // Read-only properties exposed via getters
    get readyState() { return this._readyState; }
    get status() { return this._status; }
    get statusText() { return this._statusText; }
    get response() { return this._response; }
    get responseText() { return this._responseText; }
    get responseType() { return this._responseType; }
    get responseURL() { return this._responseURL; }
    get timeout() { return this._timeout; }
    get withCredentials() { return this._withCredentials; }
    
    // Writable properties
    set responseType(value) { this._responseType = value; }
    set timeout(value) { this._timeout = value; }
    set withCredentials(value) { this._withCredentials = value; }
    
    // Change ready state and fire event
    _setReadyState(state) {
      this._readyState = state;
      console.log(`[XHR Polyfill v3] 📊 ReadyState changed to ${state} for ${this._url}`);
      
      if (this.onreadystatechange) {
        try {
          this.onreadystatechange.call(this, { type: 'readystatechange' });
        } catch (e) {
          console.error('[XHR Polyfill v3] ❌ Error in onreadystatechange:', e);
        }
      }
    }
    
    // Fire a specific event
    _fireEvent(eventName, eventInit = {}) {
      const handler = this[`on${eventName}`];
      if (handler) {
        try {
          const event = { type: eventName, ...eventInit };
          handler.call(this, event);
          console.log(`[XHR Polyfill v3] 🎯 Fired ${eventName} for ${this._url}`);
        } catch (e) {
          console.error(`[XHR Polyfill v3] ❌ Error in on${eventName}:`, e);
        }
      }
    }
    
    // Open a request
    open(method, url, async = true, username = null, password = null) {
      this._method = method.toUpperCase();
      this._url = url;
      this._async = async;
      
      console.log(`[XHR Polyfill v3] 📋 open() called:`, {
        method: this._method,
        url: this._url,
        async: this._async
      });
      
      // Reset state
      this._requestHeaders = {};
      this._status = 0;
      this._statusText = '';
      this._response = null;
      this._responseText = '';
      this._responseURL = '';
      this._aborted = false;
      
      this._setReadyState(1); // OPENED
    }
    
    // Set a request header
    setRequestHeader(name, value) {
      this._requestHeaders[name] = value;
      console.log(`[XHR Polyfill v3] 📝 setRequestHeader: ${name} = ${value}`);
    }
    
    // Get all response headers
    getAllResponseHeaders() {
      // Return empty string for now (could be enhanced)
      return '';
    }
    
    // Get a specific response header
    getResponseHeader(name) {
      // Return null for now (could be enhanced)
      return null;
    }
    
    // Abort the request
    abort() {
      console.log(`[XHR Polyfill v3] 🛑 abort() called for ${this._url}`);
      this._aborted = true;
      this._fireEvent('abort');
      this._fireEvent('loadend');
    }
    
    // Send the request
    send(body = null) {
      console.log(`[XHR Polyfill v3] 📤 send() called:`, {
        method: this._method,
        url: this._url,
        async: this._async,
        online: navigator.onLine
      });
      
      // Fire loadstart
      this._fireEvent('loadstart');
      
      // For HEAD requests to game files, return success immediately
      if (this._method === 'HEAD' && this._isGameFile(this._url)) {
        console.log(`[XHR Polyfill v3] ⚡ HEAD request for game file - returning success immediately`);
        this._simulateHeadSuccess();
        return;
      }
      
      // Build fetch options
      const fetchOptions = {
        method: this._method,
        headers: this._requestHeaders,
        credentials: this._withCredentials ? 'include' : 'same-origin'
      };
      
      if (body && this._method !== 'GET' && this._method !== 'HEAD') {
        fetchOptions.body = body;
      }
      
      // Use fetch() to make the request
      console.log(`[XHR Polyfill v3] 🌐 Using fetch() for ${this._url}`);
      
      fetch(this._url, fetchOptions)
        .then(response => {
          if (this._aborted) return;
          
          console.log(`[XHR Polyfill v3] ✅ fetch() succeeded:`, {
            url: this._url,
            status: response.status,
            statusText: response.statusText
          });
          
          this._status = response.status;
          this._statusText = response.statusText;
          this._responseURL = response.url;
          
          // Set state to HEADERS_RECEIVED
          this._setReadyState(2);
          
          // Set state to LOADING
          this._setReadyState(3);
          
          // Read response based on responseType
          if (this._responseType === 'arraybuffer') {
            return response.arrayBuffer();
          } else if (this._responseType === 'blob') {
            return response.blob();
          } else if (this._responseType === 'json') {
            return response.json();
          } else {
            // Default to text
            return response.text();
          }
        })
        .then(data => {
          if (this._aborted) return;
          
          console.log(`[XHR Polyfill v3] 📦 Response data received for ${this._url}`, {
            type: typeof data,
            length: data?.length || data?.size || 'unknown'
          });
          
          // Set response data
          this._response = data;
          if (typeof data === 'string') {
            this._responseText = data;
          }
          
          // Set state to DONE
          this._setReadyState(4);
          
          // Fire events
          this._fireEvent('load');
          this._fireEvent('loadend');
        })
        .catch(error => {
          if (this._aborted) return;
          
          console.error(`[XHR Polyfill v3] ❌ fetch() failed for ${this._url}:`, error);
          
          // Set error state
          this._status = 0;
          this._statusText = '';
          this._setReadyState(4);
          
          // Fire error events
          this._fireEvent('error');
          this._fireEvent('loadend');
        });
    }
    
    // Check if URL is a game file
    _isGameFile(url) {
      const isHtml5game = url.includes('/html5game/') || url.startsWith('html5game/');
      const isTxtOrIni = url.endsWith('.txt') || url.endsWith('.ini');
      return isHtml5game && isTxtOrIni;
    }
    
    // Simulate successful HEAD request
    _simulateHeadSuccess() {
      setTimeout(() => {
        if (this._aborted) return;
        
        this._status = 200;
        this._statusText = 'OK';
        this._responseURL = this._url;
        this._response = '';
        this._responseText = '';
        
        this._setReadyState(2); // HEADERS_RECEIVED
        this._setReadyState(3); // LOADING
        this._setReadyState(4); // DONE
        
        this._fireEvent('load');
        this._fireEvent('loadend');
        
        console.log(`[XHR Polyfill v3] ✅ HEAD request simulated successfully for ${this._url}`);
      }, 0);
    }
  }
  
  // Copy static constants
  FetchBasedXHR.UNSENT = 0;
  FetchBasedXHR.OPENED = 1;
  FetchBasedXHR.HEADERS_RECEIVED = 2;
  FetchBasedXHR.LOADING = 3;
  FetchBasedXHR.DONE = 4;
  
  // Replace global XMLHttpRequest
  window.XMLHttpRequest = FetchBasedXHR;
  
  console.log('[XHR Polyfill v3] ✅ Installation complete - All XHR requests will now use fetch()');
  console.log('[XHR Polyfill v3] 🎮 Game should now work offline!');
})();
