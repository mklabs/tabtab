const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');

describe('tabtab basic suite', () => {
  it('returns its name', () => {
    assert.equal(tabtab(), 'tabtab');
  });

  it('has a tabtab.log function', () => {
    assert.equal(typeof tabtab.log, 'function');

    const environment = Object.assign({}, process.env, {
      COMP_CWORD: 2,
      COMP_LINE: 'tabtab --foo',
      COMP_POINT: 12
    });

    const env = tabtab.parseEnv(environment);

    const result = tabtab.log(['--foo', '--bar'], env);
    assert.deepEqual(result.args, ['--foo']);
    assert.deepEqual(result.env, env);
  });

  it('has a tabtab.log function, without env', () => {
    const result = tabtab.log(['--foo', '--bar']);
    assert.deepEqual(result.args, ['--foo', '--bar']);
    assert.deepEqual(result.env, {
      args: [],
      complete: false,
      last: '',
      lastPartial: '',
      line: '',
      partial: '',
      point: 0,
      prev: undefined,
      words: 0
    });
  });

  it('tabtab.shell()', () => {
    let shell = tabtab.shell();
    assert.equal(shell, 'bash');

    shell = tabtab.shell({ SHELL: '/bin/bash' });
    assert.equal(shell, 'bash');

    shell = tabtab.shell({ SHELL: '/usr/bin/zsh'});
    assert.equal(shell, 'zsh');

    shell = tabtab.shell({ SHELL: '/usr/bin/fish'});
    assert.equal(shell, 'fish');
  });
});
