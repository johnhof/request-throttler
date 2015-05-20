var app = require('koa')();
var throttler = require('./../lib').koa;

app.use(throttler({
  requestsPerSecond : 1,
  timeToLive        : 30,
  throttle          : function *() {
    console.log('I\'ve been throttled!');
    this.status = 503;
    this.body = {
      success : false,
      message : 'Service unavailable'
    }
  },
  error : function *(error) {
    console.log(error.stack);
    this.status = 500;
    this.body = {
      success : false,
      message : 'Internal server error'
    }
  }
}));

app.use(function *() {
  this.body = { success : true };
});

app.listen(4444);
