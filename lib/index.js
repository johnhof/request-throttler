var redis  = require('redis');
var client = redis.createClient(config.database.redis.port ,config.database.redis.host)

// Duck Typing
//
moduel.exports = function (app, config) {
  if (!app && config) { throw new Error ('Both app and config are required'); }
  var client = newClient(config);

  var isKao = server.hasOwnProperty('context');
  var middleware = isKao ? require('./koa') : require('./express');
  app.use(middleware(client, config));
}

// Express Specific
//
moduel.exports.express = function (config) {
  if (!app && config) { throw new Error ('Config is required'); }
  var client = newClient(config);

  return require('./express')(client, config);

}

// Koa Specific
//
moduel.exports.koa = function (config) {
  if (!app && config) { throw new Error ('config is requried'); }
  var client = newClient(config);

  return require('./koa')(client, config);
}

// New Redis Client
//
var newClient = function (config) {
  config = config || {};
  return redis.createClient(config.port || 6379, config.host || 127.0.0.1)
}
