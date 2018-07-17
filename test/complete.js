const fs       = require('fs');
const path     = require('path');
const Complete = require('../lib/complete');
const assert   = require('assert');
const debug    = require('debug')('tabtab:test:complete');

describe('Complete', () => {

  beforeEach(() => {
    this.complete = new Complete({
      name: 'tabtab'
    });
  });

  it('Complete#new', () => {
    assert.ok(this.complete instanceof require('events').EventEmitter);
  });

  it('Complete#parseEnv', () => {
    const env = this.complete.parseEnv({
      env: {
        // Passing here numbers as String to mimick console behavior
        COMP_CWORD: '3',
        COMP_POINT: '5',
        COMP_LINE: 'foo bar --foobar'
      }
    });

    assert.strictEqual(env.words, 3);
    assert.strictEqual(env.point, 5);
    assert.strictEqual(env.line, 'foo bar --foobar');

    assert.equal(env.partial, 'foo b');
    assert.equal(env.last, '--foobar');
    assert.equal(env.lastPartial, 'b');
    assert.equal(env.prev, 'bar');
  });

  describe('Complete#handle', () => {
    it('Emits appropriate event', (done) => {
      this.complete.on('someProgram foo', (data, callback) => {
        assert.equal(data.line, 'someProgram foo ');
        debug('Sending results from test foo and bar');
        callback(null, ['--foo', '--bar']);
        done();
      });

      this.complete.handle({
        _: ['completion', '--', 'someProgram'],
        env: {
          COMP_LINE: 'someProgram foo ',
          COMP_CWORD: 1,
          COMP_POINT: 7
        }
      });
    });
  });
});
