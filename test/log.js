const tabtab = require('..');
const assert = require('assert');

describe('tabtab.log', () => {
  it('tabtab.log throws an Error in case args is not an Array', () => {
    assert.throws(() => {
      tabtab.log('foo', 'bar');
    }, /^Error: log: Invalid arguments, must be an array$/);
  });

  const logTestHelper = items => {
    const logs = [];
    const { log } = console;
    console.log = data => logs.push(data);
    tabtab.log(items);
    console.log = log;
    return logs;
  };

  it('tabtab.log logs item to the console', () => {
    assert.equal(typeof tabtab.log, 'function');

    const logs = logTestHelper(['--foo', '--bar']);

    assert.equal(logs.length, 2);
    assert.deepStrictEqual(logs, ['--foo', '--bar']);
  });

  it('tabtab.log accepts { name, description }', () => {
    const logs = logTestHelper([
      { name: '--foo', description: 'Foo options' },
      { name: '--bar', description: 'Bar option' }
    ]);

    assert.equal(logs.length, 2);
    assert.deepStrictEqual(logs, ['--foo', '--bar']);
  });

  it('tabtab.log normalize String and Objects', () => {
    const logs = logTestHelper([
      { name: '--foo', description: 'Foo options' },
      { name: '--bar', description: 'Bar option' },
      'foobar'
    ]);

    assert.equal(logs.length, 3);
    assert.deepStrictEqual(logs, ['--foo', '--bar', 'foobar']);
  });

  it('tabtab.log normalize String and Objects, with description stripped out on Bash', () => {
    const shell = process.env.SHELL;
    process.env.SHELL = '/bin/bash';
    const logs = logTestHelper([
      { name: '--foo', description: 'Foo options' },
      { name: '--bar', description: 'Bar option' },
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);

    assert.equal(logs.length, 4);
    assert.deepStrictEqual(logs, ['--foo', '--bar', 'foobar', 'barfoo']);
    process.env.SHELL = shell;
  });

  it('tabtab.log with description NOT stripped out on Zsh', () => {
    const shell = process.env.SHELL;
    process.env.SHELL = '/usr/bin/zsh';
    const logs = logTestHelper([
      { name: '--foo', description: 'Foo option' },
      { name: '--bar', description: 'Bar option' },
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);

    assert.equal(logs.length, 4);
    assert.deepStrictEqual(logs, [
      '--foo:Foo option',
      '--bar:Bar option',
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);
    process.env.SHELL = shell;
  });

  it('tabtab.log with description NOT stripped out on fish', () => {
    const shell = process.env.SHELL;
    process.env.SHELL = '/usr/bin/fish';
    const logs = logTestHelper([
      { name: '--foo', description: 'Foo option' },
      { name: '--bar', description: 'Bar option' },
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);

    assert.equal(logs.length, 4);
    assert.deepStrictEqual(logs, [
      '--foo\tFoo option',
      '--bar\tBar option',
      'foobar',
      'barfoo\tbarfoo is not foobar'
    ]);
    process.env.SHELL = shell;
  });

  it('tabtab.log could use {name, description} for completions with ":" in them', () => {
    const shell = process.env.SHELL;
    process.env.SHELL = '/usr/bin/zsh';
    const logs = logTestHelper([
      { name: '--foo:bar', description: 'Foo option' },
      { name: '--bar:foo', description: 'Bar option' },
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);

    assert.equal(logs.length, 4);
    assert.deepStrictEqual(logs, [
      '--foo\\:bar:Foo option',
      '--bar\\:foo:Bar option',
      'foobar',
      'barfoo:barfoo is not foobar'
    ]);
    process.env.SHELL = shell;
  });
});
