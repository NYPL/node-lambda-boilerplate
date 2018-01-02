/* eslint-disable semi */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getOauthConfig, fetchAccessToken, handleAuthentication } from '../../src/helpers/OAuthHelper';
import LambdaError from '../../src/helpers/ErrorHelper';
const expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

describe('Lambda: OAuthHelper', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('getOauthConfig(clientId, clientSecret, scope, grantType) function', () => {
    it('should throw an error if the cliendId parameter is NULL', () => {
      expect(() => getOauthConfig(null, 'clientSecret', 'scope')).to.throw(/the clientId parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the clientId parameter is NOT a string', () => {
      expect(() => getOauthConfig({}, 'clientSecret', 'scope')).to.throw(/the clientId parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig(123, 'clientSecret', 'scope')).to.throw(/the clientId parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the clientId parameter is an EMPTY string', () => {
      expect(() => getOauthConfig('', 'clientSecret', 'scope')).to.throw(/the clientId parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig(' ', 'clientSecret', 'scope')).to.throw(/the clientId parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the clientSecret parameter is NULL', () => {
      expect(() => getOauthConfig('clientId', null, 'scope')).to.throw(/the clientSecret parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the clientSecret parameter is NOT a string', () => {
      expect(() => getOauthConfig('clientId', {}, 'scope')).to.throw(/the clientSecret parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig('clientId', 123, 'scope')).to.throw(/the clientSecret parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the clientSecret parameter is an EMPTY string', () => {
      expect(() => getOauthConfig('clientId', '', 'scope')).to.throw(/the clientSecret parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig('clientId', '', 'scope')).to.throw(/the clientSecret parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the scope parameter is NULL', () => {
      expect(() => getOauthConfig('clientId', 'clientSecret', null)).to.throw(/the scope parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the scope parameter is NOT a string', () => {
      expect(() => getOauthConfig('clientId', 'clientSecret', {})).to.throw(/the scope parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig('clientId', 'clientSecret', 123)).to.throw(/the scope parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should throw an error if the scope parameter is an EMPTY string', () => {
      expect(() => getOauthConfig('clientId', 'clientSecret', '')).to.throw(/the scope parameter is not defined or invalid; must be of type string and not empty/);
      expect(() => getOauthConfig('clientId', 'clientSecret', ' ')).to.throw(/the scope parameter is not defined or invalid; must be of type string and not empty/);
    });

    it('should set the grantType as default value if not defined', () => {
      const result = getOauthConfig('clientId', 'clientSecret', 'scope');

      expect(result).to.be.an('object').and.to.deep.equal({
        client_id: 'clientId',
        client_secret: 'clientSecret',
        grant_type: 'client_credentials',
        scope: 'scope'
      });
    });

    it('should set the grantType optional parameter and NOT use the default', () => {
      const result = getOauthConfig('clientId', 'clientSecret', 'scope', 'customGrantType');

      expect(result).to.be.an('object').and.to.deep.equal({
        client_id: 'clientId',
        client_secret: 'clientSecret',
        grant_type: 'customGrantType',
        scope: 'scope'
      });
    });
  });

  describe('fetchAccessToken(oauthUrl, clientId, clientSecret, scope, grantType) function', () => {
    it('should reject the Promise if the oauthUrl string parameter is NULL', () => {
      const result = fetchAccessToken(null, 'clientId', 'clientSecret', 'scope', 'customGrantType');
      return result.should.be.rejectedWith(LambdaError, 'the oauthUrl function parameter is not defined or invalid; must be of type string and not empty');
    });

    it('should reject the Promise if the oauthUrl string parameter is NOT a string', () => {
      const result = fetchAccessToken({}, 'clientId', 'clientSecret', 'scope', 'customGrantType');
      return result.should.be.rejectedWith(LambdaError, 'the oauthUrl function parameter is not defined or invalid; must be of type string and not empty');
    });

    it('should reject the Promise if the oauthUrl string parameter is EMPTY', () => {
      const result = fetchAccessToken(' ', 'clientId', 'clientSecret', 'scope', 'customGrantType');
      return result.should.be.rejectedWith(LambdaError, 'the oauthUrl function parameter is not defined or invalid; must be of type string and not empty');
    });

    it('should resolve the Promise with an access_token when the OAuth URL is valid', () => {
      mock.onPost().reply(
        200,
        {
          access_token: 'validaccesstoken'
        }
      );

      const response = fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope');
      return response.should.be.fulfilled.and.should.become('validaccesstoken');
    });

    it('should reject the Promise with an error response when response does not contain an access_token key', () => {
      mock.onPost().reply(
        200,
        {}
      );

      const response = fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope');

      return response.should.be.rejectedWith(LambdaError, 'the oAuthResponse object contained an undefined access_token property');
    });

    it('should reject the Promise with an error response when the OAuth server returns a 404', () => {
      mock.onPost().reply(404);

      const response = fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope');
      return response.should.be.rejected.and.should.eventually.have.property('statusCode', 404);
    });

    it('should reject the Promise with an error response when the OAuth server returns a 500 (Internal Server Error)', () => {
      mock.onPost().reply(500);

      const response = fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope');
      return response.should.be.rejected.and.should.eventually.have.property('statusCode', 500);
    });
  });

  describe('handleAuthentication(cachedToken, fetchTokenCallbackFn) function', () => {
    it('should resolve the Promise when the cachedToken parameter is already defined', () => {
      const result = handleAuthentication('cachedTokenValue');
      return result.should.be.fulfilled.and.should.eventually.deep.equal({
        tokenType: 'cached-token',
        token: 'cachedTokenValue'
      });
    });

    it('should call the fetchTokenCallbackFn to resolve a new token when the cachedToken is not defined', () => {
      mock.onPost().reply(
        200,
        {
          access_token: 'newAccessTokenResolved'
        }
      );

      const result = handleAuthentication(null, fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope'));

      return result.should.be.fulfilled.and.should.eventually.deep.equal({
        tokenType: 'new-token',
        token: 'newAccessTokenResolved'
      });
    });

    it('should call the fetchTokenCallbackFn when the cachedToken is undefined and if an API (5xx) error occurs should reject the Promise with the error', () => {
      mock.onPost().reply(500);

      const result = handleAuthentication(null, fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope'));

      return result.should.be.rejected.and.should.eventually.have.property('statusCode', 500);
    });

    it('should call the fetchTokenCallbackFn when the cachedToken is undefined and if an API (4xx) error occurs should reject the Promise with the error', () => {
      mock.onPost().reply(401);

      const result = handleAuthentication(null, fetchAccessToken('http://oauth.testurl.org', 'clientId', 'clientSecret', 'scope'));

      return result.should.be.rejected.and.should.eventually.have.property('statusCode', 401);
    });
  });
});
