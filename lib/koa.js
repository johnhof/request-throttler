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
    let data = yield config.getFingerprint(fingerprintId);
    let success = yield config.setFingerprint(fingerprintId, data);
    if (!success) throw new Error('Failed to set fingerprint.');

    if (helpers.shouldThrottle(data)) {
      yield throttle.call(this, data);
      return;
    }

    yield next;
  }
}
