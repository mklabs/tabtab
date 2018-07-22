const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');

describe('tabtab basic suite', () => {
  it('returns its name', () => {
    assert.equal(tabtab(), 'tabtab');
  });

  it('has a tabtab.log function', () => {
    assert.equal(typeof tabtab.log, 'function');

    const env = Object.assign({}, process.env, {
      COMP_CWORD: 2,
      COMP_LINE: 'tabtab --foo',
      COMP_POINT: 12
    });

    tabtab.log(['--foo', '--bar'], env);
  });
});
