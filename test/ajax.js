var chai    = require('chai'),
    sinon   = require('sinon'),
    Promise = require('native-promise-only');

chai.use(require('sinon-chai'));

var expect = chai.expect;

var root = typeof window != 'undefined' ? window : global;

var XMLHttpRequest = root.XMLHttpRequest = require("mock-xhr").request;

var open = sinon.spy(XMLHttpRequest.prototype, 'open');
var setRequestHeader = sinon.spy(XMLHttpRequest.prototype, 'setRequestHeader');

var ajax = require('..');

describe('Backbone.NativeAjax', function() {

  afterEach(function() {
    open.reset();
    setRequestHeader.reset();
  });


  describe('creating a request', function() {
    it('should throw when no options object is passed', function() {
      expect(ajax).to.throw(Error, /You must provide options/);
    });
    it('should pass the url to XHR', function() {
      ajax({url: 'test'});
      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWithExactly('GET', 'test', true);
    });
    it('should stringify GET data when present', function() {
      ajax({url: 'test', data: {a: 1, b: 2}});
      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWithExactly('GET', 'test?a=1&b=2', true);
    });
    it('should append GET data to the URL when querystring already exists', function() {
      ajax({url: 'test?a=1', data: {b: 2}});
      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWithExactly('GET', 'test?a=1&b=2', true);
    });
  });

  describe('headers', function() {
    it('should set headers if none passed in', function() {
      ajax({url: 'test', dataType: 'json'});

      expect(setRequestHeader).to.have.been.calledOnce;
      expect(setRequestHeader).to.have.been.calledWithExactly('Accept', "application/json, text/javascript, */*; q=0.01")
    });

    it('should use headers if passed in', function() {
      ajax({url: 'test', dataType: '*', headers: {a: 1, b: 2}});
      expect(setRequestHeader).to.have.been.calledThrice;
      // expect(setRequestHeader.firstCall).to.have.been.calledWithExactly()
    });

    it('should use custom accept header if passed in', function() {
      ajax({url: 'test', dataType: 'json', headers: {Accept: 'application/xml, application/json;q=0.9'}});

      expect(setRequestHeader).to.have.been.calledOnce;
      expect(setRequestHeader).to.have.been.calledWithExactly('Accept', 'application/xml, application/json;q=0.9');
    });
  });

  describe('finishing a request', function() {
    it('should invoke the success callback on complete', function() {
      var success = sinon.mock(), error = sinon.mock();

      var options = {url: 'test', success: success, error: error};
      var req = ajax(options);
      var xhr = options.originalXhr;

      xhr.receive(200, {id: 1});

      expect(success).to.have.been.calledOnce;
      expect(success).to.have.been.calledWithExactly({id: 1});
      expect(error).not.to.have.been.called;
    });

    it('should invoke the error callback on error', function() {
      var success = sinon.mock(), error = sinon.mock();

      var options = {url: 'test', success: success, error: error};
      var req = ajax(options);
      var xhr = options.originalXhr;

      xhr.err();

      expect(error).to.have.been.calledOnce;
      expect(error).to.have.been.calledWithExactly(xhr, 0, sinon.match.instanceOf(Error));
      expect(success).not.to.have.been.called;
    });
  });

  describe('Parsing the response', function() {
    it('should use options.dataType to determine the response type', function() {
      var success = sinon.mock();

      var options = {url: 'test', success: success, dataType: 'json'};
      var req = ajax(options);
      var xhr = options.originalXhr;

      xhr.receive(200, '{"id": 1}');

      expect(success).to.have.been.calledWithExactly({id: 1});
    });

    it('should use the content type header to determine the response type if no options.dataType is given', function() {
      var success = sinon.mock();

      var options = {url: 'test', success: success};
      var req = ajax(options);
      var xhr = options.originalXhr;
      xhr.getResponseHeader = function() {
        return 'application/json';
      }

      xhr.receive(200, '{"id": 1}');

      expect(success).to.have.been.calledWithExactly({id: 1});
    });

    it('should use the accept headers to determine the response type if options.dataType and the content type header are insufficient', function() {
      var success = sinon.mock();

      var options = {
        url: 'test',
        success: success,
        headers: {
          Accept: 'application/vnd+myformat,application/json;q=0.9,*/*;q=0.1'
        } 
      };
      var req = ajax(options);
      var xhr = options.originalXhr;
      xhr.getResponseHeader = function() {
        return 'application/vnd+myformat';
      }

      xhr.receive(200, '{"id": 1}');

      expect(success).to.have.been.calledWithExactly({id: 1});
    });

    it('should return the plain text response if it cannot determine the response type', function() {
      var success = sinon.mock();

      var options = {url: 'test', success: success};
      var req = ajax(options);
      var xhr = options.originalXhr;
      xhr.getResponseHeader = function() {
        return 'application/vnd+myformat';
      }

      xhr.receive(200, '{"id": 1}');

      expect(success).to.have.been.calledWithExactly('{"id": 1}');
    });
  });

  describe('Promise', function() {
    afterEach(function() {
      delete root.Promise;
      delete ajax.Promise;
    });

    it('should respect a global Promise constructor if one set', function() {
      root.Promise = Promise;
      expect(ajax({url: 'test'})).to.be.an.instanceof(Promise);
    });

    it('should prefer Backbone.ajax.Promise over global', function() {
      root.Promise = function() {};
      ajax.Promise = Promise;
      var req = ajax({url: 'test'});
      expect(req).to.be.an.instanceof(Promise);
      expect(req).not.to.be.an.instanceof(root.Promise);
    });

    describe('with a Promise set', function() {

      var xhr, req;
      beforeEach(function() {
        ajax.Promise = Promise;
        var options = {url: 'test'};
        req = ajax(options);
        xhr = options.originalXhr;
      });

      it('should resolve the deferred on complete', function(done) {
        req.then(function(resp) {
          expect(resp).to.deep.equal({id: 1});
          done()
        }).catch(function(err) {
          throw new Error('Should not have been called');
        });

        // specific to mock-xhr
        xhr.receive(200, {id: 1});
      });

      it('should reject the deferred on error', function(done) {
        req.then(function() {
          throw new Error('Should not have been called');
        }).catch(function(err) {
          expect(err).to.equal(xhr);
          done();
        })

        // specific to mock-xhr
        xhr.err();
      });

    });
  });

  describe('XHR', function() {

    var req, xhr;
    beforeEach(function() {
      var options = {url: 'test'};
      req = ajax(options);
      xhr = options.originalXhr;
    });

    it('should expose common XHR methods and properties', function() {
      var props = ['readyState', 'status', 'statusText', 'responseText', 'responseXML'];
      var methods = ['setRequestHeader', 'getAllResponseHeaders', 'getResponseHeader', 'statusCode', 'abort'];

      props.forEach(function(prop) {
        expect(prop).to.exist;
      });

      methods.forEach(function(method) {
        expect(method).to.be.a.function;
      });

      it('should update XHR methods and properties onreadystatechange', function(done) {
        expect(req.status).to.equal(0);
        expect(req.status).to.equal(xhr.status);

        xhr.receive(200, {id: 1});

        expect(req.status).to.equal(200);
        expect(req.status).to.equal(xhr.status);
      });
    });
  });
});
