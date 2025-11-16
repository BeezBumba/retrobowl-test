// Complete XMLHttpRequest Polyfill using fetch()
// This replaces XHR entirely with fetch-based implementation
(function() {
  'use strict';
  
  console.log('[XHR Polyfill] Installing complete XMLHttpRequest replacement...');
  
  // Save original XHR for non-game files
  const OriginalXHR = window.XMLHttpRequest;
  
  // Custom XHR implementation
  function FetchBasedXHR() {
    // State
    this.readyState = 0; // UNSENT
    this.response = null;
    this.responseText = '';
    this.responseType = '';
    this.responseURL = '';
    this.responseXML = null;
    this.status = 0;
    this.statusText = '';
    this.timeout = 0;
    this.upload = {};
    this.withCredentials = false;
    
    // Event handlers
    this.onreadystatechange = null;
    this.onload = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onprogress = null;
    this.onerror = null;
    this.onabort = null;
    this.ontimeout = null;
    
    // Private state
    let _method = '';
    let _url = '';
    let _async = true;
    let _requestHeaders = {};
    let _aborted = false;
    let _timedOut = false;
    let _fetchController = null;
    
    // Helper to fire event
    const fireEvent = (type, event) => {
      if (this['on' + type]) {
        this['on' + type].call(this, event || new Event(type));
      }
    };
    
    // Helper to change ready state
    const changeReadyState = (state) => {
      this.readyState = state;
      fireEvent('readystatechange');
    };
    
    // open()
    this.open = function(method, url, async = true, user, password) {
      _method = method.toUpperCase();
      _url = url;
      _async = async;
      _requestHeaders = {};
      _aborted = false;
      _timedOut = false;
      
      changeReadyState(1); // OPENED
    };
    
    // setRequestHeader()
    this.setRequestHeader = function(header, value) {
      _requestHeaders[header] = value;
    };
    
    // send()
    this.send = function(body) {
      if (this.readyState !== 1) {
        throw new Error('XMLHttpRequest: send() called before open()');
      }
      
      fireEvent('loadstart');
      changeReadyState(2); // HEADERS_RECEIVED
      
      // Create absolute URL
      const absUrl = _url.startsWith('http') ? _url : new URL(_url, location.href).href;
      
      // Setup fetch options
      const fetchOptions = {
        method: _method,
        headers: _requestHeaders,
        credentials: this.withCredentials ? 'include' : 'same-origin',
        signal: null
      };
      
      if (body && _method !== 'GET' && _method !== 'HEAD') {
        fetchOptions.body = body;
      }
      
      // Setup abort controller
      if (typeof AbortController !== 'undefined') {
        _fetchController = new AbortController();
        fetchOptions.signal = _fetchController.signal;
      }
      
      // Setup timeout
      let timeoutId = null;
      if (this.timeout > 0) {
        timeoutId = setTimeout(() => {
          _timedOut = true;
          if (_fetchController) _fetchController.abort();
          this.status = 0;
          this.statusText = '';
          changeReadyState(4); // DONE
          fireEvent('timeout');
          fireEvent('loadend');
        }, this.timeout);
      }
      
      // Execute fetch
      fetch(absUrl, fetchOptions)
        .then(response => {
          if (_aborted || _timedOut) return;
          
          // Clear timeout
          if (timeoutId) clearTimeout(timeoutId);
          
          // Set response properties
          this.status = response.status;
          this.statusText = response.statusText;
          this.responseURL = response.url;
          
          changeReadyState(3); // LOADING
          
          // Get response body based on method
          if (_method === 'HEAD') {
            return Promise.resolve('');
          }
          
          return response.text();
        })
        .then(text => {
          if (_aborted || _timedOut) return;
          
          // Set response data
          this.responseText = text || '';
          this.response = text || '';
          
          changeReadyState(4); // DONE
          
          // Fire events
          fireEvent('load');
          fireEvent('loadend');
        })
        .catch(error => {
          if (_aborted) {
            // Abort already handled
            return;
          }
          
          if (_timedOut) {
            // Timeout already handled
            return;
          }
          
          // Clear timeout
          if (timeoutId) clearTimeout(timeoutId);
          
          // Network error
          this.status = 0;
          this.statusText = '';
          changeReadyState(4); // DONE
          fireEvent('error');
          fireEvent('loadend');
        });
    };
    
    // abort()
    this.abort = function() {
      _aborted = true;
      if (_fetchController) {
        _fetchController.abort();
      }
      this.status = 0;
      this.statusText = '';
      if (this.readyState > 0 && this.readyState < 4) {
        changeReadyState(4); // DONE
        fireEvent('abort');
        fireEvent('loadend');
      }
    };
    
    // getAllResponseHeaders()
    this.getAllResponseHeaders = function() {
      // Can't get headers from fetch after response is consumed
      return '';
    };
    
    // getResponseHeader()
    this.getResponseHeader = function(header) {
      // Can't get headers from fetch after response is consumed
      return null;
    };
    
    // overrideMimeType()
    this.overrideMimeType = function(mimeType) {
      // Not implemented
    };
    
    // addEventListener()
    this.addEventListener = function(type, listener) {
      // Simple implementation
      const prop = 'on' + type;
      if (prop in this) {
        const oldHandler = this[prop];
        this[prop] = function(e) {
          if (oldHandler) oldHandler.call(this, e);
          listener.call(this, e);
        };
      }
    };
    
    // removeEventListener()
    this.removeEventListener = function(type, listener) {
      // Not fully implemented
    };
    
    // dispatchEvent()
    this.dispatchEvent = function(event) {
      const type = event.type;
      if (this['on' + type]) {
        this['on' + type].call(this, event);
      }
    };
  }
  
  // Constants
  FetchBasedXHR.UNSENT = 0;
  FetchBasedXHR.OPENED = 1;
  FetchBasedXHR.HEADERS_RECEIVED = 2;
  FetchBasedXHR.LOADING = 3;
  FetchBasedXHR.DONE = 4;
  
  FetchBasedXHR.prototype.UNSENT = 0;
  FetchBasedXHR.prototype.OPENED = 1;
  FetchBasedXHR.prototype.HEADERS_RECEIVED = 2;
  FetchBasedXHR.prototype.LOADING = 3;
  FetchBasedXHR.prototype.DONE = 4;
  
  // Replace global XMLHttpRequest
  window.XMLHttpRequest = FetchBasedXHR;
  
  console.log('[XHR Polyfill] ✅ XMLHttpRequest replaced with fetch-based implementation');
  console.log('[XHR Polyfill] All XHR requests will now use fetch() internally');
})();
