
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
module.exports.setFingerprint = function *(ctx, count) {
  var id            = getFingerprintId(ctx);
  var existingPrint = yield getFingerprint(ctx);

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
module.exports.getFingerprint = function *(ctx) {
  var id = getFingerprintId(ctx);

  return yield function (cb) {
    client.get(id, function (error, result) {
      try {
        result = JSON.parse(result)

        // kill the record is it's older than the time to live
        var time     = (new Date()).getTime();
        var ageInSec = (time - result.created)/1000;
        if (ageInSec > config.throttling.time_to_live) {
          client.del(id);
          result = false;
        }
      } catch(e) {
        ctx.error(e);
        result = null
      }

      return cb(null, result);
    });
  }
}

//
// Get Fingerprint ID
//
// Parameters:
//   ctx
//     [Object] - request context
//
// Returns:
//   [String] - fingerprint ID
//
module.exports.getFingerprintId = function (ctx) {
  return 'fingerprint:' + ctx.ip + '__' + JSON.stringify(ctx.request.header);
}
