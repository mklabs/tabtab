const tabtab = require('..');
const assert = require('assert');
const minimist = require('minimist');

describe('tabtab.parseEnv()', () => {
  it('parseEnv with COMP stuff', () => {
    assert.equal(typeof tabtab.parseEnv, 'function');

    const opts = minimist(['foo', 'bar', 'baz']);

    const result = tabtab.parseEnv(
      Object.assign({}, process.env, {
        COMP_CWORD: 3,
        COMP_LINE: 'foo bar baz',
        COMP_POINT: 11
      }),
      opts
    );

    assert.deepEqual(result, {
      args: ['foo', 'bar', 'baz'],
      complete: false,
      words: 3,
      point: 11,
      line: 'foo bar baz',
      partial: 'foo bar baz',
      last: 'baz',
      lastPartial: 'baz',
      prev: 'bar'
    });
  });

  it('parseEnv without COMP stuff', () => {
    const opts = minimist(['foo', 'bar', 'baz']);

    const result = tabtab.parseEnv(Object.assign({}, process.env), opts);

    assert.equal(result.complete, false);
  });
});
