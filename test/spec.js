var Traceroute = require('../'),
  should = require('should');

var target = '8.8.8.8', // Google DNS
  hopProperties = ['counter', 'ip', 'ms'];

describe('Traceroute-lite', function () {
  this.timeout(60000);

  it('should be requireable', function () {
    (Traceroute).should.be.a.Function;
  });

  it('should return a Traceroute instance', function () {
    var traceroute = new Traceroute(target);
    (traceroute).should.be.an.instanceOf(Traceroute);
    (traceroute).should.have.properties(['host', 'platform', 'profile']);
    (traceroute.start).should.be.a.Function;
    (traceroute.reset).should.be.a.Function;
  })

  describe('Events', function () {

    describe('done', function () {

      it('should produce an error when an invalid host is provided', function (done) {
        var traceroute = new Traceroute('this is an invalid host');
        traceroute.on('done', function (err, hops) {
          (err).should.be.an.Error;
          done();
        });
        traceroute.start();
      });

      it('should produce an array of hops', function (done) {
        var traceroute = new Traceroute(target);
        traceroute.on('done', function (err, hops) {
          (err === null).should.equal(true, (err || {}).message);
          (hops).should.be.an.Array;
          (hops[0]).should.have.properties(hopProperties)
          done();
        });
        traceroute.start();
      });

    });

    describe('hop', function () {

      it('should emit a hop object', function (done) {
        var traceroute = new Traceroute(target);
        var aHop;
        traceroute.on('hop', function (hop) {
          (hop).should.be.an.Object;
          (hop).should.have.properties(hopProperties);
          aHop = hop;
        });
        traceroute.on('done', function (err, hops) {
          (aHop).should.be.an.Object.with.properties(hopProperties);
          done();
        });
        traceroute.start();
      });

    });

  });

  describe('Callback', function () {

    it('should produce an error when an invalid host is provided', function (done) {
      var traceroute = new Traceroute('this is an invalid host');
      traceroute.start(function (err, hops) {
        (err).should.be.an.Error;
        done();
      });
    });

    it('should produce an array of hops', function (done) {
      var traceroute = new Traceroute(target);
      traceroute.start(function (err, hops) {
        (err === null).should.equal(true, (err || {}).message);
        (hops).should.be.an.Array;
        (hops[0]).should.have.properties(hopProperties)
        done();
      });
    });

  });

});
