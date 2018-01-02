/* eslint-disable semi */
export default class LambdaError extends Error {
  constructor (message, opts = {}) {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('an error message is required');
    }

    super(message);

    // Capturing stack trace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    /* Optional error object parameters below */

    // Utilized to store the error type, helpful for debugging the type of error
    // i.e. throw LambdaError('Missing API url in getApiData()', { type: 'function-parameter-error' });
    if (opts.type) {
      this.type = opts.type;
    }

    // Utilized to store the status code returned from an http response
    // i.e. throw LambdaError('An error occured from Holds API', { statusCode: serverResponse.status });
    if (opts.statusCode) {
      this.statusCode = opts.statusCode;
    }

    // Utilized to store debug objects returned from an http response
    // i.e. throw LambdaError('An error occured from Holds API', { debugInfo: serverResponse });
    if (opts.debugInfo) {
      this.debugInfo = opts.debugInfo;
    }
  }
};
