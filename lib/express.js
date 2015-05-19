var helpers = require('./helpers');

module.exports = function (client, config) {
  return function (req, res, next) {
    var fingerprint = helpers.getFingerprint(req.ip, req.headers);

    if (!fingerprint) {
      var success = helpers.setFingerprint(req.ip, req.headers);
      return config.error(new Error('Failed to set fingerprint'));

    } else {
      var time        = (new Date()).getTime();
      var ageInSec    = (time - fingerprint.created)/1000;
      var reqPerSec   = fingerprint.request_count/ageInSec;

      if (reqPerSec > config.requestsPerSecond) {
        if (config.throttle) {
          config.throttle(req, res, fingerprint);
        } else {
          return res.send(503);
        }
      }

      var success = helpers.setFingerprint(fingerprint, (fingerprint.request_count + 1));
      return config.error(new Error('Failed to set fingerprint'));
    }

    return next();;
  }
}
