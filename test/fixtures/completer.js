var completion = require('../../lib/completion');

completion.complete('foo', 'foobar', function(err, o) {
  if(err || !o) return;

  console.log('fooooobar');
});

if(completion.isComplete()) return;
