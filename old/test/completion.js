

var vows = require('vows'),
assert = require('assert'),
completion = require('../lib/completion');

vows.describe('basic test suite for completion output')
  .addBatch({
    'basic completion on a foo command': {
      topic: function() {
        // prepare env variables and argv before requiring the completion module
        process.argv = process.argv.slice(0, 2).concat('completion');
        process.env.COMP_CWORD = 1;
        process.env.COMP_POINT = 10;
        process.env.COMP_LINE = 'foo foobarbaaaz';
        completion.complete('foo', this.callback);
      },

      'should return the expected completion results': function(err, results) {
        assert.deepEqual(results, { 
          line: 'foo foobarbaaaz',
          words: '1',
          point: '10',
          partial: 'foo foobar',
          last: 'foobarbaaaz',
          prev: 'foo',
          lastPartial: 'foobar'
        });

      }
    }
  }).export(module);
