const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');

describe('tabtab basic suite', () => {
  it('returns its name', () => {
    assert.equal(tabtab(), 'tabtab');
  });
});
