'use strict';

let _ = require('lodash');

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
  helpers.setFingerprint = function *(id, data) {
    data = JSON.stringify(data);
    return yield function (cb) {
      client.set(id, data, function (error) {
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
        result = JSON.parse(result);
        result = helpers.incrementData(result);
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
  helpers.shouldThrottle = function (data) {
    return (data.n >= config.nIntervals && data.averageInterval < config.minAverageIntervalMs);
  };


  //
  // Increment data
  //
  // Increments request data with new request
  //
  //

  helpers.incrementData = function (data) {
    let timestamp = (new Date()).getTime();
    if (!_.isObject(data)) return {
      n: 0,
      lastTimestamp: timestamp,
      averageInterval: 0
    };

    data.n = Math.min(data.n, (config.nIntervals - 1));
    data.averageInterval *= data.n;
    data.averageInterval += timestamp - data.lastTimestamp;
    data.n++;
    data.averageInterval /= data.n;
    data.lastTimestamp = timestamp;

    return data;
  };

  return helpers;
};
