var helpers = require('./helpers');

module.exports = function (client, config) {
  return function *() {
    var fingerprint = yield helpers.getFingerprint(this);

    if (!fingerprint) {
      var success = yield helpers.setFingerprint(this);
      if (!success) { return yield this.error(503, responses[503]); }

    } else {
      var time        = (new Date()).getTime();
      var ageInSec    = (time - fingerprint.created)/1000;
      var reqPerSec   = fingerprint.request_count/ageInSec;

      if (reqPerSec > config.throttling.max_reqs_per_sec) { return yield this.error(503, responses[503]); }

      var success = yield helprs.setFingerprint(this, (fingerprint.request_count + 1));
      if (!success) { return yield this.error(503, responses[503]); }
    }

    yield next;
  }
}
