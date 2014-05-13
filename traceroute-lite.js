var spawn = require('child_process').spawn,
    events = require('events'),
    WIN = /^win/.test(process.platform),
    LIN = /^linux/.test(process.platform),
    MAC = /^darwin/.test(process.platform);

module.exports = Traceroute;

function Traceroute(host, options) {
  if (!host)
    throw new Error('You must specify a host to trace!');

  this._host = host;
  this._options = options = (options || {});
  this._hops = [];

  events.EventEmitter.call(this);

  if (WIN) {
    this._bin = 'c:/windows/system32/tracert.exe';
    this._args = (options.args) ? options.args.concat(host) : [ '-d', host ];
    this._eol = /\r\n/;
    this._reghop = /(\d+)\s+(\*|\d+ ms)\s+(\*|\d+ ms)\s+(\*|\d+ ms)\s+([^\s]+)/;
    this._parsehop = function(hopline) {
      return {
        ip: hopline[5],
        ms: hopline.splice(2,3).map(function(time) { return (time === '*') ? null : time.replace(/ ms/, ''); })
      }
    };
  }
  else if (LIN) {
    this._bin = '/bin/traceroute';
    this._args = (options.args) ? options.args : [ '-n', '-w', '2', '-c', '1', host ];
    this._regmatch = /time=(.+?) ms/; // need to verify this
  }
  else if (MAC) {
    this._bin = '/sbin/traceroute';
    this._args = (options.args) ? options.args : [ '-n', '-t', '2', '-c', '1', host ];
    this._regmatch = /time=(.+?) ms/;
  }
  else {
    throw new Error('Could not detect your traceroute binary.');
  }

  return this;
};

Traceroute.prototype.__proto__ = events.EventEmitter.prototype;

// START A TRACE
// =============
Traceroute.prototype.start = function(callback) {
  var self = this;

  this._traceroute = spawn(this._bin, this._args);
  this._hoplines = [];
  this._hops = [];

  this._traceroute.on('error', function(err) {
    if (callback)
      callback(err);
    else
      self.emit('error', err);
  });

  this._traceroute.stdout.on('data', function(data) {
    this._stdout = (this._stdout || '') + data;
    this._stdout.split(self._eol).forEach(function(line) {
      var hopline = line.match(self._reghop);
      if (hopline && self._hoplines.indexOf(line) === -1) {
        var hop = self._parsehop(hopline);
        self._hops.push(hop);
        self.emit('hop', hop);
        self._hoplines.push(line);
      }
    });
  });

  this._traceroute.stderr.on('data', function(data) {
    this._stderr = (this._stderr || '') + data;
  });

  this._traceroute.on('exit', function(code) {
    var stdout = this.stdout._stdout,
        stderr = this.stderr._stderr;
    if (stderr) stderr = new Error(stderr);
    if (callback)
      callback(stderr, self._hops);
    else
      self.emit('done', stderr, self._hops);
  });
}
