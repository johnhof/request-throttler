
module.exports = function (client, config) {
  var helpers = {};

  //
  // Set Fingerprint
  //
  // Parameters:
  //   ctx
  //     [Object] - request context
  //
  //   count
  //     [Number] - new request count to set
  //
  //
  // Returns:
  //   [Object] - updated fingerprint
  //     OR
  //   [Null] - the fingerprint was not set
  //
  helpers.setFingerprint = function *(id, count) {
    var existingPrint = yield helpers.getFingerprint(id);
    return yield function (cb) {
      client.set(id, JSON.stringify({
        request_count : count || 1,
        created       : (existingPrint || {}).created || (new Date()).getTime()
      }), function (error) {
        return cb(null, !error);
      });
    }
  }

  //
  // Get Fingerprint
  //
  // Parameters:
  //   ctx
  //     [Object] - request context
  //
  // Returns:
  //   [Object] - fingerprint found
  //     OR
  //   [Null] - no fingerprint found
  //
  helpers.getFingerprint = function *(id) {
    return yield function (cb) {
      client.get(id, function (error, result) {

        try {
          result = JSON.parse(result)

          // kill the record if it's older than the time to live
          if (helpers.isExpired(result)) {
            client.del(id);
            result = false;
          }
        } catch(e) {
          result = false;
        }

        return cb(null, result);
      });
    }
  }


  //
  // Should Throttle
  //
  // Parameters:
  //   fingerprint
  //     [Object] - fingerprint object
  //
  // Returns:
  //   [Boolean] - age in secon
  //
  helpers.shouldThrottle = function (fingerprint) {
    var time        = (new Date()).getTime();
    var ageInSec    = (time - fingerprint.created)/1000;
    var reqPerSec   = fingerprint.request_count/ageInSec;
    return (ageInSec > 1) && (reqPerSec > config.requestsPerSecond);
  }


  //
  // Is Expired
  //
  // Parameters:
  //   fingerprint
  //     [Object] - fingerprint object
  //
  // Returns:
  //   [Boolean] - whether or not the fingerprint is expired
  //
  helpers.isExpired = function (fingerprint) {
    var time        = (new Date()).getTime();
    var ageInSec    = (time - fingerprint.created)/1000;
    return config.timeToLive < ageInSec;
  }

  // Return helpers
  //
  return helpers;
}
