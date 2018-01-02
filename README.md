# Node Lambda Boilerplate
[![Coverage Status](https://coveralls.io/repos/github/NYPL/node-lambda-boilerplate/badge.svg)](https://coveralls.io/github/NYPL/node-lambda-boilerplate)
[![Build Status](https://travis-ci.org/NYPL/node-lambda-boilerplate.svg?branch=master)](https://travis-ci.org/NYPL/node-lambda-boilerplate)
[![Dependency Status](https://gemnasium.com/badges/github.com/NYPL/cancel-request-consumer.svg)](https://gemnasium.com/github.com/NYPL/node-lambda-boilerplate)

A boilerplate (starter kit) for writing AWS Lambdas in Node using the [node-lambda](https://www.npmjs.com/package/node-lambda) module. Supports ES7 syntax via babel and contains pre-configured NPM scripts found in `package.json` that enable you to run your lambda locally, test your code, package and deploy your lambda to AWS based of your `aws-profile`.

## Table of Contents
- [Requirements](#requirements)
- Getting Started
  - [Installation](#installation)
  - [Setup Configurations](#setup-configurations)
  - [Developing Locally](#developing-locally)
  - [Deploying your Lambda](#deploying-your-lambda)
  - [Tests](#tests)
  - [Linting](#linting)
- [Dependencies](#npm-dependencies)

## Version
> v1.0.0

## Requirements
> Written in ES7
> AWS Node Target - [Node 6.10.3](https://nodejs.org/docs/v6.10.3/api/)

## Features
* Pre-built NPM scripts to setup configuration files, run the lambda locally and deploy to the appropriate AWS profile environments
* Supports ES7 syntax via Babel transpilation
* Unit tests scaffolding and examples are setup in `./test`
* Contains full test coverage integration via Mocha & Istanbul
* Supports TravisCI for running test and is setup to add CI
* All code is linted via StandardJS
* Contains helper methods used repeatedly across services (OAuth/Caching)
* Integrates Logging and conforms to [NYPL Standards](https://github.com/NYPL/engineering-general/blob/master/standards/logging.md)
* Integrates KMS decryption when `NODE_ENV` is set to `production` for AWS environments
* Contains custom ErrorHelper that is customizable for better error tracing

## Getting Started

### Installation

Install all Node dependencies via NPM
```bash
$ npm install
```

### Setup Configurations

Once all dependencies are installed, you want to run the following NPM commands included in the `package.json` configuration file to setup a local development environment.

#### Step 1: Create an `.env` file for the `node-lambda` module
> Copies the sample .env file under ./sample/.env.sample into ./.env

```bash
$ npm run setup:node-lambda-env
```

#### Step 2: Add your AWS environment variables
Once the `.env` file is copied, open the file and edit the following marked required:
```javascript
AWS_REGION=us-east-1
AWS_FUNCTION_NAME=<FUNCTION NAME> (required in UpperCamelCase)
AWS_MEMORY_SIZE=128 (required)
AWS_TIMEOUT=30 (required)
AWS_DESCRIPTION=
AWS_RUNTIME=nodejs6.10 (set as default)
AWS_VPC_SUBNETS=
AWS_VPC_SECURITY_GROUPS=
AWS_TRACING_CONFIG=
EXCLUDE_GLOBS="event.json"
PACKAGE_DIRECTORY=build
```
> Note: This ENV file is used by node-lambda to obtain your AWS basic configuration. AWS ARN_ROLE and PROFILES are handled by npm commands via --profile and --role

#### Step 3: Setup your environment specific `{environment}.env` file

Running the following NPM Commands will:

* Set up your **LOCAL** `.env` file as `./config/local.env` used for local development
```bash
$ npm run setup:local-env // Used in local development when running `npm run local-run`
```

* Set up your **DEVELOPMENT** `.env` file as `./config/development.env`
```bash
$ npm run setup:development-env
```

* Set up your **PRODUCTION** `.env` file as `./config/production.env`
```bash
$ npm run setup:production-env
```

These environment specific `.env` files will be used to set **environment variables** when deployed by the `node-lambda` module.

An example of the sample deployment environment `*.env` file:
```javascript
OAUTH_PROVIDER_URL=XXX
OAUTH_PROVIDER_SCOPE=XXX
OAUTH_CLIENT_ID=XXX
OAUTH_CLIENT_SECRET=XXX
NODE_ENV=XXX // Use 'development' when developing locally via `npm run local-run`. If deploying to AWS use 'production', this will trigger the decryption client.
```

#### Step 4: Setup your environment specific `event_sources_{environment}.json` file
This file is used by the `node-lambda` module to deploy your Lambda with the correct mappings.

You **must** edit the file once created and add your specific **EventSourceArn** value, found in the AWS Console. If no mapping is necessary, update the file to an empty object `{}`.

Running the following NPM Commands will:

* Set up your **DEVELOPMENT** `event_sources_development.json` file in `./config/`
```bash
$ npm run setup:development-sources
```

* Set up your **PRODUCTION** `event_sources_production.json` file in `./config/`
```bash
$ npm run setup:production-sources
```
### Developing Locally
To develop and run your Lambda locally you must ensure to complete `Step 1` and `Step 2` of the Setup process.

***REMINDER:*** Your `./config/local.env` and `./.env` environment variables ***MUST*** be configured in order for the next step to work.

Next, run the following NPM command to use the **sample** event found in `./sample/sample_event.json`.

> Exceutes `node lambda run` pointing the the sample event.

```bash
$ npm run local-run // Code is transpiled into dist/ and node-lambda will use that as the target path
```

### Deploying your Lambda
To deploy your Lambda function via the `node-lambda` module __**ensure**__ you have completed all the steps of the [Setup](#setup-configurations) process and have added all configuration variables required.

The following NPM Commands will execute the `node-lambda deploy` command mapping configurations to the proper environments (qa & production). These commands can be modified in `package.json`.

> Prior to the execution of any `npm deploy ...` commands, `npm run build` is executed to successfully transpile all ES7 code th Node 6.10.x

* Runs `node-lambda deploy` with **DEVELOPMENT** configurations
```bash
$ npm run deploy:development
```

* Runs `node-lambda deploy` with **PRODUCTION** configurations
```bash
$ npm run deploy:production
```

### Tests
#### Test Coverage
[Istanbul](https://github.com/istanbuljs/nyc) is currently used in conjunction with Mocha to report coverage of all unit tests.

Simply run:
```bash
$ npm run coverage:report
```

Executing this NPM command will create a `./coverage/` folder with an interactive UI reporting the coverage analysis, now you can open up `./coverage/index.html` in your browser to view an enhanced report.

#### Running Unit Tests
Unit tests are written using [Mocha](https://github.com/mochajs/mocha), [Chai](https://github.com/chaijs) and [Sinon](https://github.com/domenic/sinon-chai). All tests can be found under the `./test` directory. Mocha configurations are set and can be modified in `./test/mocha.opts`.

> To run test, use the following NPM script found in `package.json`.

```console
$ npm run test // Will run all tests found in the ./test/ path, for excluded files see nyc->exclude in package.json
```

```console
$ npm run test [filename].test.js // Will run a specific test for the given filename
```

### Linting
This codebase currently uses [Standard JS](https://www.npmjs.com/package/standard) as the JavaScript linter.

To lint files use the following NPM command:
```console
$ npm run lint // Will lint all files except those listed in package.json under standard->ignore
```

```console
$ npm run lint [filename].js // Will lint the specific JS file
```

## NPM Dependencies
* [aws-sdk](https://www.npmjs.com/package/aws-sdk)
* [async](https://www.npmjs.com/package/async)
* [axios](https://www.npmjs.com/package/axios)
* [lambda-env-vars](https://www.npmjs.com/package/lambda-env-vars)
* [qs](https://www.npmjs.com/package/qs)
* [winston](https://www.npmjs.com/package/winston)
* [node-lambda](https://www.npmjs.com/package/node-lambda)
* [mocha](https://www.npmjs.com/package/mocha)
* [chai](https://www.npmjs.com/package/chai)
* [coveralls](https://www.npmjs.com/package/coveralls)
* [sinon](https://www.npmjs.com/package/sinon)
* [sinon-chai](https://www.npmjs.com/package/sinon-chai)
* [standard-js](https://www.npmjs.com/package/standard)
* [istanbul](https://github.com/istanbuljs/nyc)
