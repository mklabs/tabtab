const tabtab = require('..');
const assert = require('assert');

describe('tabtab.parseEnv()', () => {
  it('parseEnv with COMP stuff', () => {
    assert.equal(typeof tabtab.parseEnv, 'function');

    const result = tabtab.parseEnv(
      Object.assign({}, process.env, {
        COMP_CWORD: 3,
        COMP_LINE: 'foo bar baz',
        COMP_POINT: 11
      })
    );

    assert.deepEqual(result, {
      complete: true,
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
    const result = tabtab.parseEnv(Object.assign({}, process.env));
    assert.equal(result.complete, false);
  });
});
