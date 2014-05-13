var Traceroute = require('./traceroute-lite');

var tr = new Traceroute('8.8.8.8');

tr.on('hop', function(hop) {
  console.log('HOP: ', hop);
})
//
//tr.on('done', function(err, hops) {
//  console.log('ALL DONE');
//  console.log(hops);
//})

tr.start(function(err, hops) {
  console.log('ALL DONE');
  console.log(hops);
});
