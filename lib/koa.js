'use strict';

let _  = require('lodash');
let co = require('co');

module.exports = function (client, config) {
  let helpers = require('./helpers')(client, config);

  // allow overrides
  let fingerprintSeed = _.isFunction(config.fingerprintSeed) ? config.fingerprintSeed : function (ctx) { return ctx.ip + '__' + JSON.stringify(ctx.request.headers); };
  let throttle        = _.isFunction(config.throttle) ? config.throttle : function *() { yield this.error(503); };

  return function *(next) {
    let fingerprintId = 'fingerprint:' + fingerprintSeed(this);
    let timeStamp   = yield config.getFingerprint(fingerprintId);
    let success       = false;
    if (!timeStamp || !helpers.shouldThrottle(timeStamp)) {
      success = yield config.setFingerprint(fingerprintId, (new Date()).getTime());
    } else {
      yield throttle.call(this, timeStamp);
      return;
    }

    if (!success) {
      yield config.error.call(this, new Error('Failed to set fingerprint'));
    } else {
      yield next;
    }
  }
}
