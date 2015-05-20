var _  = require('lodash');
var co = require('co');

module.exports = function (client, config) {
  var helpers = require('./helpers')(client, config);

  // allow overrides
  var fingerprintSeed = _.isFunction(config.fingerprintSeed) ? config.fingerprintSeed : function (ctx) { return ctx.ip + '__' + JSON.stringify(ctx.request.headers); };
  var throttle        = _.isFunction(config.throttle) ? config.throttle : function *() { return this.status = 503; };

  return function *(next) {
    var fingerprintId = 'fingerprint:' + fingerprintSeed(this);
    var fingerprint   = yield config.getFingerprint(fingerprintId);
    var success       = false;

    if (!fingerprint) {
      success = yield config.setFingerprint(fingerprintId);
    } else if (!helpers.shouldThrottle(fingerprint)) {
      success = yield config.setFingerprint(fingerprintId, (fingerprint.request_count + 1));
    } else {
      return yield throttle.apply(this, fingerprint);
    }

    if (!success) {
      yield config.error.apply(this, new Error('Failed to set fingerprint'));
    } else {
      yield next;
    }
  }
}
