var expect = require('chai').expect,
    sinon = require('sinon'),
    NativeAjax = require('../');

var xhr = sinon.useFakeXMLHttpRequest();

describe('Backbone.NativeAjax', function() {
  describe('setup', function() {
    it('should export itself as Backbone.ajax');
  });

  describe('creating a request', function() {
    it('should throw when no options object is passed');

  });

  describe('headers', function() {
    it('should set headers if none passed in');
    it('should use headers if passed in');
  });

  describe('finishing a request', function() {
    it('should invoke the success callback on complete');
    it('should invoke the error callback on error');
  });

  describe('Backbone.Deferred', function() {
    it('should respect a Deferred property if one set');

    it('should resolve the deferred on complete');
    it('should reject the deferred on error');

  });
});