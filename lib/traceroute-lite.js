var spawn = require('child_process').spawn,
  util = require('util'),
  fs = require('fs'),
  EventEmitter = require('events').EventEmitter;

// https://variadic.me/posts/2013-10-22-bind-call-and-apply-in-javascript.html
var bind = Function.prototype.call.bind(Function.prototype.bind);

/**
 * Detect the OS
 * @returns {String} Returns a simple, human-friendly version of the OS
 */
function Platform() {
  if (/^win/.test(process.platform))
    return 'windows';
  else if (/^linux/.test(process.platform))
    return 'linux';
  else if (/^darwin/.test(process.platform))
    return 'mac';
}

/**
 * Construct the profile for spawning the binary
 * @param   {String} platform The human-friendly version of the OS. Valid options = [ 'windows', 'linux', 'mac' ]
 * @returns {Object} A Profile object that is assigned to the `.profile` property
 */
var Profile = function (platform) {
  if (platform === 'windows')
    return {
      bin: 'c:/windows/system32/tracert.exe',
      args: ['-d'],
      hopline: /\s*\d+\s+(\d+ ms|\*)\s+(\d+ ms|\*)\s+(\d+ ms|\*)\s+.+/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);

        var counter = Number(hop.shift());
        var ip = (hop[6] && hop[6].match(/\d+\.\d+\.\d+\.\d+/)) ? hop[6] : null;
        var i = 0;
        var ms = hop.filter(function (h) {
          return Number(h);
        }).reduce(function (sum, t) {
          i += 1;
          return sum + Number(t);
        }, 0) / i;

        return {
          counter: counter,
          ip: ip,
          ms: (Number(ms)) ? Math.floor(ms) : null
        };
      }
    };
  else if (platform === 'linux')
    return {
      bin: '/bin/traceroute',
      args: ['-n', '-q', '1'],
      hopline: /\s*\d+\s+(\d+\.\d+\.\d+\.\d+\s+.+|\*)/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);
        return {
          counter: Number(hop[0]),
          ip: (hop[1] === '*') ? null : hop[1],
          ms: (hop[2]) ? Number(hop[2]) : null
        };
      }
    };
  else if (platform === 'mac')
    return {
      bin: '/usr/sbin/traceroute',
      args: ['-n', '-q', '1'],
      hopline: /\s*\d+\s+(\d+\.\d+\.\d+\.\d+\s+.+|\*)/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);
        return {
          counter: Number(hop[0]),
          ip: (hop[1] === '*') ? null : hop[1],
          ms: (hop[2]) ? Number(hop[2]) : null
        };
      }
    };
}

module.exports = Traceroute;

/**
 * The base traceroute class
 * @param   {String} host An FQDN or IP address to trace.
 * @returns {Object} Returns the base traceroute class.
 */
function Traceroute(host) {
  if (!host || typeof host !== 'string')
    throw new Error('host must be a string');

  this.host = host;
  this.platform = Platform();
  this.profile = new Profile(this.platform);

  this.reset();

  if (!fs.existsSync(this.profile.bin))
    throw new Error('Could not find ' + this.profile.bin);

  this.profile.args.push(this.host);

  return this;
}

util.inherits(Traceroute, EventEmitter);

/**
 * Helper to clear the properties.
 */
Traceroute.prototype.reset = function () {
  this.stdout = '';
  this.stderr = '';
  this.hops = [];
}

/**
 * The .start() method
 * @param {Function} callback Callback to run when the trace is complete.
 */
Traceroute.prototype.start = function (callback) {
  this.reset();

  var traceroute = spawn(this.profile.bin, this.profile.args),
    stdout = this.stdout,
    stderr = this.stderr,
    hops = this.hops,
    parse = this.profile.parse,
    hopline = this.profile.hopline,
    emit = bind(this.emit, this);

  // collect & parse stdout
  traceroute.stdout.on('data', function (data) {
    stdout += ('' + data).replace(/\n\r*/g, '|');
    if (/\|/.test(stdout))
      stdout = parseStdout(stdout);
  });

  // collect stderr
  traceroute.stderr.on('data', function (data) {
    stderr += data;
  });

  // handle when the binary exits
  traceroute.on('exit', function (code) {
    var error = (code !== 0) ? new Error(stderr.replace(/\n\r*/, ' ').trim()) : null;

    emit('done', error, hops);

    if (callback)
      callback(error, hops);
  });

  this.on('hop', function (hop) {
    hops.push(hop);
  });

  /**
   * Internal function to parse the hops. Executes the `Profile.parse()` function.
   * @param   {String} stdout The current pipe-delimited stdout
   * @returns {String} Returns the trailing stdout line for further concatenation
   */
  function parseStdout(stdout) {
    var lines = stdout.split('|');
    for (var l in lines) {
      var line = lines.shift();
      if (hopline.test(line))
        emit('hop', parse(line));
    }
    return lines.pop();
  }

}
