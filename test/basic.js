const tabtab = require('..');
const assert = require('assert');

describe('tabtab', () => {
  it('tabtab.shell()', () => {
    let shell = tabtab.shell();
    assert.equal(shell, 'bash');

    const previousShell = process.env.SHELL;
    process.env.SHELL = '/bin/bash';
    shell = tabtab.shell();
    assert.equal(shell, 'bash');

    process.env.SHELL = '/usr/bin/zsh';
    shell = tabtab.shell();
    assert.equal(shell, 'zsh');

    process.env.SHELL = '/usr/bin/fish';
    shell = tabtab.shell();
    assert.equal(shell, 'fish');

    process.env.SHELL = previousShell;
  });
});
