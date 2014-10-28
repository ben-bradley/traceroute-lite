var Traceroute = require('../'),
  should = require('should');

describe('Traceroute-lite', function () {
  this.timeout(60000);

  it('should be requireable', function () {
    (Traceroute).should.be.a.Function;
  });

  it('should return a Traceroute instance', function () {
    var traceroute = new Traceroute('8.8.8.8');
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
        var traceroute = new Traceroute('8.8.8.8');
        traceroute.on('done', function (err, hops) {
          (err === null).should.equal(true, (err || {}).message);
          (hops).should.be.an.Array;
          (hops[0]).should.have.properties(['counter', 'ip', 'ms'])
          done();
        });
        traceroute.start();
      });

    });

    describe('hop', function () {

      it('should emit a hop object', function (done) {
        var traceroute = new Traceroute('8.8.8.8');
        var aHop;
        traceroute.on('hop', function (hop) {
          (hop).should.be.an.Object;
          (hop).should.have.properties(['counter', 'ip', 'ms']);
          aHop = hop;
        });
        traceroute.on('done', function (err, hops) {
          (aHop).should.be.an.Object.with.properties(['counter', 'ip', 'ms']);
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
      var traceroute = new Traceroute('8.8.8.8');
      traceroute.start(function (err, hops) {
        (err === null).should.equal(true, (err || {}).message);
        (hops).should.be.an.Array;
        (hops[0]).should.have.properties(['counter', 'ip', 'ms'])
        done();
      });
    });

  });

});
