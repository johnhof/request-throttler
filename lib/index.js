var redis = require('redis');
var _     = require('lodash')

// Duck Typing
//
module.exports = function (app, config) {
  if (!app && config) { throw new Error ('Both app and config are required'); }

  var isKao = app.hasOwnProperty('context');
  var middleware = isKao ? require('./koa') : require('./express');
  app.use(middleware(config.client, applyConfig(config)));
}

// Express Specific
//
module.exports.express = function (config) {
  if (!config) { throw new Error ('Config is required'); }
  config = applyConfig(config);
  return require('./express')(config.client, config);

}

// Koa Specific
//
module.exports.koa = function (config) {
  if (!config) { throw new Error ('config is requried'); }
  config = applyConfig(config);
  return require('./koa')(config.client, config);
}


// Apply config
//
var applyConfig = function (config) {
  config.port   = config.port ||6379;
  config.host   = config.host || '127.0.0.1';
  config.client = _.isObject(config.client) ? config.client : redis.createClient(config.port, config.host);

  var helpers = require('./helpers')(config.client, config);
  config.getFingerprint = _.isFunction(config.getFingerprint) ? config.getFingerprint : helpers.getFingerprint;
  config.setFingerprint = _.isFunction(config.setFingerprint) ? config.setFingerprint : helpers.setFingerprint;
  config.errorHandler   = _.isFunction(config.error) ? config.error : function (err) { throw err; }
  return config;
}
