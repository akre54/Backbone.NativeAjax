var expect = require('chai').expect,
    sinon = require('sinon');

var root = typeof window != 'undefined' ? window : global;

root.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var ajax = require('../backbone.nativeajax');

// var xhr = sinon.useFakeXMLHttpRequest();

describe('Backbone.NativeAjax', function() {

  describe('creating a request', function() {
    it('should throw when no options object is passed');
    it('should stringify GET data when present');
  });

  describe('headers', function() {
    it('should set headers if none passed in');
    it('should use headers if passed in');
  });

  describe('finishing a request', function() {
    it('should invoke the success callback on complete');
    it('should invoke the error callback on error');
  });

  describe('Promise', function() {
    var Promise, resolve, reject;
    beforeEach(function() {
      Promise = function(cb) {
        cb(resolve, reject);
      };
      resolve = sinon.stub();
      reject = sinon.stub();
    });

    afterEach(function() {
      delete global.Promise;
      delete ajax.Promise;
    });

    it('should respect a global Promise constructor if one set', function() {
      global.Promise = Promise;
      expect(ajax({url: 'http://localhost.com'})).to.be.an.instanceof(Promise);
    });

    it('should prefer Backbone.ajax.Promise over global', function() {
      global.Promise = function() {};
      ajax.Promise = Promise;
      var req = ajax({url: 'http://localhost.com'});
      expect(req).to.be.an.instanceof(Promise);
      expect(req).not.to.be.an.instanceof(global.Promise);
    });

    it('should resolve the deferred on complete');
    it('should reject the deferred on error');

  });
});