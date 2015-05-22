var app = require('express')();
var throttler = require('./../lib').express;

app.use(throttler({
  requestsPerSecond : 1,
  timeToLive        : 30,
  throttle          : function (req, res, fingerprint) {
    console.log('I\'ve been throttled!');
    res.status(503).json({
      success : false,
      message : 'Service unavailable'
    });
  },
  error : function (error) {
    console.log(error.stack);
    res.status(500).json({
      success : false,
      message : 'Internal Server Error'
    });
  }
}));


app.use(function (req, res, next) {
  res.status(200).json({ success : true });
});

const PORT = 5555;
app.listen(PORT);
console.log('listening on: ' + PORT)
