const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');

describe('tabtab basic suite', () => {
  it('returns its name', () => {
    assert.equal(tabtab(), 'tabtab');
  });

  describe('tabatab.install()', () => {
    it('tabtab.install() is a function', () => {
      assert.equal(typeof tabtab.install, 'function');
    });
  });
});
