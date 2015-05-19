# request-throttler

Node middleware to throttle requests by a single use/set of users. Helpful in reducing server load, preventing datamining, and stifling brute force attacks

If a given user goes above the allowed `requestsPerSecond`, a 503 is returned for every request until the average drops. User state and request count is kept int the redis database and reset after `timeToLive` seconds

## Key

- [Usage](#usage)

## Usage

```javascript
app.use(throttler.koa({
  port              : 6379,
  host              : 127.0.0.1,
  requestsPerSecond : 50,
  timeToLive        : 60,
  throttler         : function *() {
    console.log('I\'ve been throttled!');
    this.status = 503;
    this.body = 'Service unavailable'
  },
  error : function *(error) {
    console.log(error.stack);
    this.status = 500;
    this.body = 'Internal server error'  
  }
}));

// OR

app.use(throttler.express({
  port              : 6379,
  host              : 127.0.0.1,
  requestsPerSecond : 50,
  timeToLive        : 60,
  throttler         : function () {
    console.log('I\'ve been throttled!');
    res.status(503).send('Service unavailable');
  },
  error : function (error) {
    console.log(error.stack);
    res.status(500).send('Internal server error');
  }
}));

// OR

throttler(app, {
  // ...
})
```
