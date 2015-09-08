// Backbone.NativeAjax.js 0.4.3
// ---------------

//     (c) 2015 Adam Krebs, Paul Miller, Exoskeleton Project
//     Backbone.NativeAjax may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/akre54/Backbone.NativeAjax

(function (factory) {
  if (typeof define === 'function' && define.amd) { define(factory);
  } else if (typeof exports === 'object') { module.exports = factory();
  } else { Backbone.ajax = factory(); }
}(function() {
  // Make an AJAX request to the server.
  // Usage:
  //   var req = Backbone.ajax({url: 'url', type: 'PATCH', data: 'data'});
  //   req.then(..., ...) // if Promise is set
  var ajax = (function() {
    var xmlRe = /^(?:application|text)\/xml/;
    var jsonRe = /^application\/json/;

    var getData = function(accepts, xhr) {
      if (accepts == null) accepts = xhr.getResponseHeader('content-type');
      if (xmlRe.test(accepts)) {
        return xhr.responseXML;
      } else if (jsonRe.test(accepts) && xhr.responseText !== '') {
        return JSON.parse(xhr.responseText);
      } else {
        return xhr.responseText;
      }
    };

    var isValid = function(xhr) {
      return (xhr.status >= 200 && xhr.status < 300) ||
        (xhr.status === 304) ||
        (xhr.status === 0 && window.location.protocol === 'file:')
    };

    var end = function(xhr, options, promise, resolve, reject) {
      return function() {
        updatePromise(xhr, promise);

        if (xhr.readyState !== 4) return;

        var status = xhr.status;
        var data = getData(options.headers && options.headers.Accept, xhr);

        // Check for validity.
        if (isValid(xhr)) {
          if (options.success) options.success(data);
          if (resolve) resolve(data);
        } else {
          var error = new Error('Server responded with a status of ' + status);
          if (options.error) options.error(xhr, status, error);
          if (reject) reject(xhr);
        }
      }
    };

    var updatePromise = function(xhr, promise) {
      if (!promise) return;

      var props = ['readyState', 'status', 'statusText', 'responseText',
        'responseXML', 'setRequestHeader', 'getAllResponseHeaders',
        'getResponseHeader', 'statusCode', 'abort'];

      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        promise[prop] = typeof xhr[prop] === 'function' ?
                              xhr[prop].bind(xhr) :
                              xhr[prop];
      }
      return promise;
    }

    return function(options) {
      if (options == null) throw new Error('You must provide options');
      if (options.type == null) options.type = 'GET';

      var resolve, reject, xhr = new XMLHttpRequest();
      var PromiseFn = ajax.Promise || (typeof Promise !== 'undefined' && Promise);
      var promise = PromiseFn && new PromiseFn(function(res, rej) {
        resolve = res;
        reject = rej;
      });

      if (options.contentType) {
        if (options.headers == null) options.headers = {};
        options.headers['Content-Type'] = options.contentType;
      }

      // Stringify GET query params.
      if (options.type === 'GET' && typeof options.data === 'object') {
        var query = '';
        var stringifyKeyValuePair = function(key, value) {
          return value == null ? '' :
            '&' + encodeURIComponent(key) +
            '=' + encodeURIComponent(value);
        };
        for (var key in options.data) {
          query += stringifyKeyValuePair(key, options.data[key]);
        }

        if (query) {
          var sep = (options.url.indexOf('?') === -1) ? '?' : '&';
          options.url += sep + query.substring(1);
        }
      }

      xhr.onreadystatechange = end(xhr, options, promise, resolve, reject);
      xhr.open(options.type, options.url, true);

      if(!(options.headers && options.headers.Accept)) {
        var allTypes = "*/".concat("*");
        var xhrAccepts = {
          "*": allTypes,
          text: "text/plain",
          html: "text/html",
          xml: "application/xml, text/xml",
          json: "application/json, text/javascript"
        };
        xhr.setRequestHeader(
          "Accept",
          options.dataType && xhrAccepts[options.dataType] ?
            xhrAccepts[options.dataType] + (options.dataType !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
            xhrAccepts["*"]
        );
      }

      if (options.headers) for (var key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
      }
      if (options.beforeSend) options.beforeSend(xhr);
      xhr.send(options.data);

      options.originalXhr = xhr;

      updatePromise(xhr, promise);

      return promise ? promise : xhr;
    };
  })();
  return ajax;
}));
