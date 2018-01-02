/* eslint-disable semi, no-unused-expressions */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Lambda from '../index.js';
import Cache from '../src/factories/CacheFactory';
import event from '../sample/sample_event.json';
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

const kinesisHandlerFunc = Lambda.kinesisHandler;
const handleKinesisAsyncProcessing = Lambda.handleKinesisAsyncProcessing;

describe('Lambda: Handle Kinesis Stream Input', () => {
  describe('exports.handler()', () => {
    let kinesisHandlerStub;

    beforeEach(() => {
      kinesisHandlerStub = sinon.stub(Lambda, 'kinesisHandler');
    });

    afterEach(() => {
      kinesisHandlerStub.restore();
    });

    it('should call the kinesisHandler function without ENCRYPTION when the NODE_ENV is not production', () => {
      Lambda.handler(event);
      expect(Cache.isProductionEnv()).to.equal(false);
      expect(kinesisHandlerStub).to.be.called;
    });

    it('should NOT call the kinesisHandler directly when the NODE_ENV is production and use the ENCRYPTION client', () => {
      Cache.setNodeEnv('production');
      Lambda.handler(event);
      expect(Cache.isProductionEnv()).to.equal(true);
      expect(kinesisHandlerStub).not.to.be.called;
    });

    it('should fire the callback function with an error if the event is NULL', () => {
      let callback = sinon.spy();

      Lambda.handler(null, null, callback);

      const errArg = callback.firstCall.args[0];

      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('the event.Records array is undefined');
      expect(callback).to.be.called;
    });

    it('should fire the callback function with an error if the event.Records array is empty', () => {
      let callback = sinon.spy();

      Lambda.handler({
        Records: []
      }, null, callback);

      const errArg = callback.firstCall.args[0];

      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('the event.Records array is undefined');
      expect(callback).to.be.called;
    });

    it('should fire the callback function with an error if the event.Records array does not contain Kinesis records', () => {
      let callback = sinon.spy();

      Lambda.handler({
        Records: [
          {
            notKinesis: []
          }
        ]
      }, null, callback);

      const errArg = callback.firstCall.args[0];

      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('the event.Records array does not contain a kinesis stream of records to process');
      expect(callback).to.be.called;
    });
  });

  describe('exports.kinesisHandler()', () => {
    const callbackSpy = sinon.spy();

    it('should catch an Error instance and return the callback with the error message if the config options parameter is NULL', () => {
      kinesisHandlerFunc(event.Records, null, null, callbackSpy);

      expect(callbackSpy).to.be.calledWith('missing/undefined opts object configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the config options parameter is UNDEFINED', () => {
      kinesisHandlerFunc(event.Records, undefined, null, callbackSpy);

      expect(callbackSpy).to.be.calledWith('missing/undefined opts object configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the config options parameter is an EMPTY object', () => {
      kinesisHandlerFunc(event.Records, {}, null, callbackSpy);

      expect(callbackSpy).to.be.calledWith('missing/undefined opts object configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthProviderUrl configuration parameter is undefined', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          someKey: 'someValue'
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthProviderUrl configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthProviderUrl configuration parameter is an EMPTY string', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: ''
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthProviderUrl configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthClientId configuration parameter is missing', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org'
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthClientId configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthClientId configuration parameter is an EMPTY string', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: ''
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthClientId configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthClientSecret configuration parameter is missing', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: 'client_id'
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthClientSecret configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthClientSecret configuration parameter is an EMPTY string', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: 'client_id',
          oAuthClientSecret: ' '
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthClientSecret configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthProviderScope configuration parameter is missing', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: 'client_id',
          oAuthClientSecret: 'secret'
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthProviderScope configuration parameter');
    });

    it('should catch an Error instance and return the callback with the error message if the oAuthProviderScope configuration parameter is an EMPTY string', () => {
      kinesisHandlerFunc(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: 'client_id',
          oAuthClientSecret: 'secret',
          oAuthProviderScope: ' '
        },
        null,
        callbackSpy
      );

      expect(callbackSpy).to.be.calledWith('missing/undefined oAuthProviderScope configuration parameter');
    });

    it('should call the handleKinesisAsyncProcessing function after all required parameters have been validated', () => {
      let handleKinesisAsyncProcessingStub = sinon.stub(Lambda, 'handleKinesisAsyncProcessing');

      // Execute the kinesisHandler
      Lambda.kinesisHandler(
        event.Records,
        {
          oAuthProviderUrl: 'http://oauthurl.org',
          oAuthClientId: 'client_id',
          oAuthClientSecret: 'secret',
          oAuthProviderScope: 'scope'
        }
      );

      handleKinesisAsyncProcessingStub.restore();

      expect(handleKinesisAsyncProcessingStub).to.be.called;
    });
  });

  describe('exports.handleKinesisAsyncProcessing()', () => {
    it('should be a function', () => {
      expect(handleKinesisAsyncProcessing).to.be.a('function');
    });
  });
});
