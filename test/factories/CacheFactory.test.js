/* eslint-disable semi */
import chai from 'chai';
import Cache from '../../src/factories/CacheFactory';
chai.should();
const expect = chai.expect;

describe('Cache Factory', () => {
  it('should be an singleton object', () => {
    expect(Cache).to.be.an('object');
  });

  it('should initialize the token property to NULL', () => {
    expect(Cache.token).to.equal(null);
    expect(Cache.getToken()).to.equal(null);
  });

  it('should have a getToken function', () => {
    expect(Cache.getToken).to.be.a('function');
  });

  it('should have a setToken function', () => {
    expect(Cache.setToken).to.be.a('function');
  });

  it('should retrieve the token value when calling the getToken() function', () => {
    const newToken = 'testtoken';
    Cache.setToken(newToken);
    expect(Cache.getToken()).to.equal(newToken);
  });

  it('should set the token value when using setToken(token) function', () => {
    const newToken = 'testtoken';
    Cache.setToken(newToken);
    expect(Cache.token).to.equal(newToken);
  });

  it('should initialize the nodeEnv property based off process.env.NODE_ENV', () => {
    expect(Cache.nodeEnv).to.equal(process.env.NODE_ENV);
  });

  it('should get the nodeEnv value via getNodeEnv() function', () => {
    expect(Cache.nodeEnv).to.equal(Cache.getNodeEnv());
  });

  it('should set the nodeEnv property when using setNodeEnv(env) function', () => {
    Cache.setNodeEnv('dev');
    expect(Cache.getNodeEnv()).to.equal('dev');
  });
});
