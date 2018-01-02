/* eslint-disable semi */
import LambdaEnvVars from 'lambda-env-vars';
import { handleAuthentication, fetchAccessToken } from './src/helpers/OAuthHelper';
import Cache from './src/factories/CacheFactory';
import LambdaError from './src/helpers/ErrorHelper';
import logger from './src/utilities/Logger';

const lambdaEnvVarsClient = new LambdaEnvVars();

exports.handleKinesisAsyncProcessing = async function (records, opts, context, callback) {
  try {
    const {
      oAuthProviderUrl,
      oAuthClientId,
      oAuthClientSecret,
      oAuthProviderScope
    } = opts;

    // Example of async/await promise handling
    const tokenResponse = await handleAuthentication(
      Cache.getToken(),
      fetchAccessToken(oAuthProviderUrl, oAuthClientId, oAuthClientSecret, oAuthProviderScope)
    );

    if (tokenResponse.tokenType === 'new-token') {
      logger.info('Obtained a new access token from the OAuth Service');
      Cache.setToken(tokenResponse.token);
    } else {
      logger.info('Using existing access token from Cache');
    }

    return callback(null, 'The Lambda has successfully completed all operations; no fatal errors have occured');
  } catch (e) {
    if (typeof e === 'string' || e instanceof String) {
      logger.error(`a fatal error occured, the lambda will NOT restart; ${e}`, { debugInfo: e });
      return false;
    }

    logger.error('[handleKinesisAsyncProcessing function]: An unhandled error occured', { debugInfo: e });
    return callback(e);
  }
};

exports.kinesisHandler = (records, opts, context, callback) => {
  try {
    if (!opts || Object.keys(opts).length === 0) {
      throw new LambdaError(
        'missing/undefined opts object configuration parameter',
        { type: 'function-parameter-error' }
      );
    }

    if (!opts.oAuthProviderUrl || typeof opts.oAuthProviderUrl !== 'string' || opts.oAuthProviderUrl.trim() === '') {
      throw new LambdaError(
        'missing/undefined oAuthProviderUrl configuration parameter',
        { type: 'function-parameter-error' }
      );
    }

    if (!opts.oAuthClientId || typeof opts.oAuthClientId !== 'string' || opts.oAuthClientId.trim() === '') {
      throw new LambdaError(
        'missing/undefined oAuthClientId configuration parameter',
        { type: 'function-parameter-error' }
      );
    }

    if (!opts.oAuthClientSecret || typeof opts.oAuthClientSecret !== 'string' || opts.oAuthClientSecret.trim() === '') {
      throw new LambdaError(
        'missing/undefined oAuthClientSecret configuration parameter',
        { type: 'function-parameter-error' }
      );
    }

    if (!opts.oAuthProviderScope || typeof opts.oAuthProviderScope !== 'string' || opts.oAuthProviderScope.trim() === '') {
      throw new LambdaError(
        'missing/undefined oAuthProviderScope configuration parameter',
        { type: 'function-parameter-error' }
      );
    }

    return exports.handleKinesisAsyncProcessing(records, opts, context, callback);
  } catch (e) {
    logger.error(`[kinesisHandler function error]: ${e.message}`, { debugInfo: e });
    return callback(e.message);
  }
};

exports.handler = (event, context, callback) => {
  if (event && Array.isArray(event.Records) && event.Records.length > 0) {
    const record = event.Records[0];
    // Handle Kinesis Stream
    if (record.kinesis && record.kinesis.data) {
      // Execute the handler in local development mode, without decryption
      if (!Cache.isProductionEnv()) {
        logger.info('executing kinesisHandler in local development mode');

        return exports.kinesisHandler(
          event.Records,
          {
            oAuthProviderUrl: process.env.OAUTH_PROVIDER_URL,
            oAuthClientId: process.env.OAUTH_CLIENT_ID,
            oAuthClientSecret: process.env.OAUTH_CLIENT_SECRET,
            oAuthProviderScope: process.env.OAUTH_PROVIDER_SCOPE
          },
          context,
          callback
        );
      }

      // Handle Production decryption and execution of kinesisHandler
      return lambdaEnvVarsClient.getCustomDecryptedValueList(
        [
          'OAUTH_CLIENT_ID',
          'OAUTH_CLIENT_SECRET',
          'OAUTH_PROVIDER_SCOPE'
        ],
        { location: 'lambdaConfig' })
        .then(resultObject => {
          return exports.kinesisHandler(
            event.Records,
            {
              oAuthProviderUrl: process.env.OAUTH_PROVIDER_URL,
              oAuthClientId: resultObject.OAUTH_CLIENT_ID,
              oAuthClientSecret: resultObject.OAUTH_CLIENT_SECRET,
              oAuthProviderScope: resultObject.OAUTH_PROVIDER_SCOPE
            },
            context,
            callback
          );
        })
        .catch(error => {
          logger.error(
            '[handler function error]: an error occured while decrypting the Lambda ENV variables via LambdaEnvVarsClient',
            { debugInfo: error }
          );

          return callback(new Error('[handler function error]: an error occured while decrypting the Lambda ENV variables via LambdaEnvVarsClient'));
        });
    }

    logger.error('[handler function error]: the event.Records array does not contain a kinesis stream of records to process');
    return callback(new Error('the event.Records array does not contain a kinesis stream of records to process'));
  }

  logger.error('[handler function error]: the event.Records array is undefined');
  return callback(new Error('the event.Records array is undefined'));
};
