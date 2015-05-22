# request-throttler

Middleware to throttle requests by a single use/set of users. Helpful in reducing server load, preventing datamining, and stifling brute force attacks

If a given user goes above the allowed `requestsPerSecond`, a 503 is returned for every request until the average drops. User state and request count is kept int the redis database and reset after `timeToLive` seconds. The user request count is stored in a redis database, specified during configuration.

It's important to note that the count can only be updated as fast as the redis database allows access. if two requests come in at the same time, the count will only be increased by one.

## Key

- [Usage](#usage)
- [Configuration](#configuration)
  - [config.host](#configport)
  - [config.port](#configport)
  - [config.requestsPerSecond](#configrequestspersecond)
  - [config.timeToLive](#configtimetplive)
  - [config.throttler](#configthrottler)
  - [config.error](#configerror)


## Usage

### koa

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
```

### express

```javascript
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
```

### Duck type

```javascript
// app is express or koa

throttler(app, {
  port              : 6379,
  host              : 127.0.0.1,
  requestsPerSecond : 50,
  timeToLive        : 60,
})
```

## Configuration

### config.host

- **Optional**
- The host where the redis database can be accessed
- Default: `127.0.0.1`

```javascript
config.host = 127.0.0.1
```

### config.port

- **Optional**
- The port where the redis database can be accessed
- Default: `6379`

```javascript
config.port = 6379
```

### config.requestsPerSecond

- **Required**
- The number of request per second allowed by a user
- Make sure to base this on uniqueness of the fingerprint

```javascript
config.requestsPerSecond = 30;
```

### config.timeToLive

- **Required**
- The lifespan (in seconds) of the fingerprint store
- Lower lifespan will cause faster fingerprint expiration and cut down on storage size
- Higher lifespan will allow a users request to normalize over time (bursts will be less likely to throttle the user)

```javascript
config.timeToLive = 60;
```

### config.throttler

- **Optional**
- The handler called when a user is throttled
- Default: sends a 503 and generic `Service unavailable` message

```javascript
// express
config.throttler = function () {
  console.log('I\'ve been throttled!');
  res.status(503).send('Service unavailable');
}

//koa
config.throttler = function *(error) {
  console.log(error.stack);
  this.status = 500;
  this.body = 'Internal server error'  
}
```

### config.error

- **Optional**
- The handler called if an error occurs
- Default: sends a 500 and generic `Internal server error` message

```javascript
// express
config.error = function (error) {
  console.log(error.stack);
  res.status(500).send('Internal server error');
}

//koa
config.error = function *(error) {
  console.log(error.stack);
  this.status = 500;
  this.body = 'Internal server error'  
}
```
