var expect = require('chai').expect,
    sinon = require('sinon'),
    ajax = require('../');

var xhr = sinon.useFakeXMLHttpRequest();

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

    it('should respect a global Promise constructor if one set');

    it('should prefer Backbone.ajax.Promise over global');

    it('should resolve the deferred on complete');
    it('should reject the deferred on error');

  });
});