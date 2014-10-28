var spawn = require('child_process').spawn,
  util = require('util'),
  fs = require('fs'),
  EventEmitter = require('events').EventEmitter;

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
      hopline: /\s*\d+\s+\d+\.\d+\.\d+\.\d+\s+.+/,
      parse: function (hop) {
        return {
          ip: hop[5],
          ms: hop.splice(2, 3).map(function (time) {
            return (time === '*') ? null : time.replace(/ ms/, '');
          })
        }
      }
    };
  else if (platform === 'linux')
    return {
      bin: '/bin/traceroute',
      args: ['-n', '-q', '1'],
      hopline: /\s*\d+\s+\d+\.\d+\.\d+\.\d+\s+.+/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);
        return {
          counter: hop[0],
          ip: (hop[1] === '*') ? null : hop[1],
          ms: (hop[2]) ? Number(hop[2]) : null
        };
      }
    };
  else if (platform === 'mac')
    return {
      bin: '/usr/sbin/traceroute',
      args: ['-n', '-q', '1'],
      hopline: /\s*\d+\s+\d+\.\d+\.\d+\.\d+\s+.+/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);
        return {
          counter: hop[0],
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

  if (!fs.existsSync(this.profile.bin))
    throw new Error('Could not find ' + this.profile.bin);

  this.profile.args.push(this.host);

  return this;
}

util.inherits(Traceroute, EventEmitter);

/**
 * The .start() method
 * @param {Function} callback Callback to run when the trace is complete.
 */
Traceroute.prototype.start = function (callback) {
  var traceroute = spawn(this.profile.bin, this.profile.args),
    stdout = this.stdout = '',
    stderr = this.stderr = '',
    hops = this.hops = [],
    _this = this;

  traceroute.stdout.on('data', function (data) {
    stdout += ('' + data).replace(/\n\r*/g, ',');
    parseHops();
  });

  traceroute.stderr.on('data', function (data) {
    stderr += data;
  });

  traceroute.on('exit', function (code) {
    var error = (code !== 0) ? new Error(stderr.replace(/\n\r*/, ' ').trim()) : null;

    _this.emit('done', error, hops);

    if (callback)
      callback(error, hops);
  });

  /**
   * Internal function to parse the hops.
   * Executes the `Profile.parse()` function.
   */
  function parseHops() {
    var lines = stdout.split(',');
    stdout = lines.pop();
    for (var l in lines) {
      var line = lines.shift();
      console.log(line, _this.profile.hopline);
      if (!_this.profile.hopline.test(hop))
        continue;
      var hop = _this.profile.parse(line);
      hops.push(hop);
      _this.emit('hop', hop);
    }
  }

}
