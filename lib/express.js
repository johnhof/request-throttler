var _  = require('lodash');
var _  = require('lodash');
var co = require('co');

module.exports = function (client, config) {
  var helpers = require('./helpers')(client, config);

  // allow overrides
  var fingerprintSeed = _.isFunction(config.fingerprintSeed) ? config.fingerprintSeed : function (req) { return req.ip + '__' + JSON.stringify(req.headers); };
  var throttle        = _.isFunction(config.throttle) ? config.throttle : function (req, res) { return res.send(503); };

  return function (req, res, next) {
    co(function *() {
      var fingerprintId = 'fingerprint:' + fingerprintSeed(req);
      var fingerprint   = yield config.getFingerprint(fingerprintId);
      var success       = false;

      if (!fingerprint) {
        success = yield config.setFingerprint(fingerprintId);
      } else if (!helpers.shouldThrottle(fingerprint)) {
        success = yield config.setFingerprint(fingerprintId, (fingerprint.request_count + 1));
      } else {
        return throttle(req, res, fingerprint);
      }

      if (!success) {
        return config.error(new Error('Failed to set fingerprint'));
      } else {
        return next();
      }
    }).catch(function (err) {
      try {
        config.error(err);
      } catch (e) {
        throw e
      };
    });
  }
}
