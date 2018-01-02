/* eslint-disable semi */
const Cache = {
  token: null,
  nodeEnv: process.env.NODE_ENV,
  getToken () {
    return this.token;
  },
  setToken (token) {
    this.token = token;
  },
  getNodeEnv () {
    return this.nodeEnv;
  },
  setNodeEnv (env) {
    this.nodeEnv = env;
  },
  isProductionEnv () {
    return this.nodeEnv === 'production';
  }
};

export default Cache;
