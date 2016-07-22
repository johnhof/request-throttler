'use strict';

module.exports = function (client, config) {
  let helpers = {};

  //
  // Set Fingerprint
  //
  // Parameters:
  //   id
  //     [String] - string to use as key for redis store
  //
  //   unixTimestampe
  //     [Number] - timestamp of the request
  //
  //
  // Returns:
  //   [Object] - updated fingerprint
  //     OR
  //   [Null] - the fingerprint was not set
  //
  helpers.setFingerprint = function *(id, unixTimestamp) {
    return yield function (cb) {
      client.set(id, unixTimestamp, function (error) {
        return cb(null, !error);
      });
    }
  };

  //
  // Get Fingerprint
  //
  // Parameters:
  //   id
  //     [String] - string to use as key for redis store
  //
  // Returns:
  //   [Object] - fingerprint found
  //     OR
  //   [Null] - no fingerprint found
  //
  helpers.getFingerprint = function *(id) {
    return yield function (cb) {
      client.get(id, function (error, result) {
        return cb(null, result);
      });
    }
  };


  //
  // Should Throttle
  //
  // Parameters:
  //   timestamp
  //     [Number] - timestamp used to calculate the interval for throttling
  //
  // Returns:
  //   [Boolean] - whether interval is below minimum threshold
  //
  helpers.shouldThrottle = function (timestamp) {
    let interval = (new Date()).getTime() - timestamp;
    return interval < config.minIntervalMs;
  };

  return helpers;
};
