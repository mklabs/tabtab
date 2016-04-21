const Complete = require('../src/complete');
const assert   = require('assert');

describe('Complete', () => {

  beforeEach(() => {
    this.complete = new Complete();
  });

  it('Complete#new', () => {
    assert.ok(this.complete instanceof require('events').EventEmitter);
  });

  it('Complete#parseEnv', () => {
    var env = this.complete.parseEnv();
    assert.ok(env.args && env.args.length);
    assert.ok(!env.complete);
    assert.strictEqual(env.words, 0);
    assert.strictEqual(env.point, 0);
    assert.strictEqual(env.line, '');

    env = this.complete.parseEnv({
      env: {
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

});
