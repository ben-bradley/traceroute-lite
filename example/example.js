var Traceroute = require('../');

var tr = new Traceroute('8.8.8.8');

tr.on('hop', function (hop) {
  console.log('hop:', hop);
});

tr.on('done', function (err, hops) {
  console.log('===[ EVENT ]===');
  console.log(arguments);
})

tr.start(function (err, hops) {
  console.log('===[ CALLBACK ]===');
  console.log(arguments);
});
