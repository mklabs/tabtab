const tabtab = require('..');
const assert = require('assert');

describe('tabtab basic suite', () => {
  it('returns its name', () => {
    assert.equal(tabtab(), 'tabtab');
  });

  it('has a tabtab.log function', () => {
    assert.equal(typeof tabtab.log, 'function');


    const logs = [];
    const log = console.log;
    console.log = data => logs.push(data);

    tabtab.log(['--foo', '--bar']);

    console.log = log;
    assert.equal(logs.length, 2);
    assert.deepStrictEqual(logs, ['--foo', '--bar']);
  });

  it('tabtab.shell()', () => {
    let shell = tabtab.shell();
    assert.equal(shell, 'bash');

    shell = tabtab.shell({ SHELL: '/bin/bash' });
    assert.equal(shell, 'bash');

    shell = tabtab.shell({ SHELL: '/usr/bin/zsh' });
    assert.equal(shell, 'zsh');

    shell = tabtab.shell({ SHELL: '/usr/bin/fish' });
    assert.equal(shell, 'fish');
  });
});
