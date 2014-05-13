traceroute-lite [![Build Status](https://secure.travis-ci.org/ben-bradley/traceroute-lite.png)](http://travis-ci.org/ben-bradley/traceroute-lite) [![NPM](https://nodei.co/npm/traceroute-lite.png?downloads=true)](https://nodei.co/npm/traceroute-lite/)
=========
A simple traceroute module for NodeJS apps.

Install
=======
`npm install traceroute-lite`

Test
====
`cd node_modules/traceroute-lite && mocha`

Usage
=====
```javascript
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.on('hop', function(hop) {
  console.log(hop); // { ip: '1.2.3.4', ms: [ 23, null, 67 ] }
});

traceroute.start(function(err, hops) {
  console.log(hops);
  /* [
   *  { ip: '1.2.3.4', ms: [ 12, 34, 56 ] },
   *  { ip: '1.2.3.4', ms: [ 23, null, 45 ] },
   *  ...
   * ]
   */
});
```

Events
======
- `error` = When the `._bin` throws an error
- `hop` = When an individual hop is detected, responds with (`{ ip: '1.2.3.4', ms: [ 12, null, 56 ] }`)
- `done` = When the `._bin` completes, responds with (`err`, `Array of hops`)

Methods
=======
- **#start(callback)** accepts an optional callback that returns (`Error`, `Array of hops`)

Examples
========
```javascript
// start a traceroute and handle it with callbacks
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.start(function(err, hops) {
  console.log(hops);
  /* [
   *  { ip: '1.2.3.4', ms: [ 12, 34, 56 ] },
   *  { ip: '1.2.3.4', ms: [ 23, null, 45 ] },
   *  ...
   * ]
   */
});
```
```javascript
// start a traceroute & handle it with events
var Traceroute = require('traceroute-lite');

var traceroute = new Traceroute('8.8.8.8');

traceroute.on('hop', function(hop) {
  console.log(hop); // { ip: '1.2.3.4', ms: [ 23, null, 67 ] }
});

traceroute.on('done', function(err, hops) {
  console.log(hops);
  /* [
   *  { ip: '1.2.3.4', ms: [ 12, 34, 56 ] },
   *  { ip: '1.2.3.4', ms: [ 23, null, 45 ] },
   *  ...
   * ]
   */
});

traceroute.start();
```
