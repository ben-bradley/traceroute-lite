# traceroute-lite [![Build Status](https://secure.travis-ci.org/ben-bradley/traceroute-lite.png)](http://travis-ci.org/ben-bradley/traceroute-lite) [![NPM](https://nodei.co/npm/traceroute-lite.png?downloads=true)](https://nodei.co/npm/traceroute-lite/)

A simple traceroute module for NodeJS apps.

## Install

```
npm install traceroute-lite`
```

-or-

```
npm install ben-bradley/traceroute-lite
```

## Test

```
npm test
```

## Usage

```javascript
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.on('hop', function(hop) {
  console.log(hop); // { ip: '1.2.3.4', ms: 12 }
});

traceroute.start(function(err, hops) {
  console.log(hops);
  /* [
   *  { counter: 1, ip: '1.2.3.4', ms: 12 },
   *  { counter: 2, ip: '1.2.3.5', ms: 34 },
   *  ...,
   *  { counter: n, ip: '8.8.8.8', ms: 10 }
   * ]
   */
});
```

## Hop

A 'hop' is a unique IP that your trace crosses.  They are represented as objects using this schema:

```javascript
{
  counter: Number, // A number representing which hop this is in sequence.
  ip: String, // The IP address of the interface on the remote device.
  ms: Number, // The milliseconds it takes to reach that IP
}
```

If a hop fails to respond, the `ip` and `ms` are `null`.

## Events

- `hop` = When an individual hop is detected, responds with `({ counter: 1, ip: '1.2.3.4', ms: 12 })`.
- `done` = When the trace is complete, responds with `(error, hops)`.  The `done` event occurs before the callback is executed.

## Methods

- `Traceroute.start(callback)` accepts an optional callback that returns `(error, hops)`.  The `done` event occurs before the callback is executed.

## Examples

Using a `callback`:

```javascript
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.start(function(err, hops) {
  console.log(hops);
  /* [
   *  { counter: 1, ip: '1.2.3.4', ms: 12 },
   *  { counter: 2, ip: '1.2.3.5', ms: 34 },
   *  ...,
   *  { counter: n, ip: '8.8.8.8', ms: 10 }
   * ]
   */
});
```

Using `Event`s:

```javascript
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.on('hop', function(hop) {
  console.log(hop); // { counter: 1, ip: '1.2.3.4', ms: 12 }
});

traceroute.on('done', function(err, hops) {
  console.log(hops);
  /* [
   *  { counter: 1, ip: '1.2.3.4', ms: 12 },
   *  { counter: 2, ip: '1.2.3.5', ms: 34 },
   *  ...,
   *  { counter: n, ip: '8.8.8.8', ms: 10 }
   * ]
   */
});

traceroute.start();
```
