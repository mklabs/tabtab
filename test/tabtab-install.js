const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');
const path = require('path');
const debug = require('debug')('tabtab:test:install');

// inquirer-test needs a little bit more time, or my setup
const TIMEOUT = 500;
const { UP, DOWN, ENTER } = run;

describe('tabtab.install()', () => {
  it('is a function', () => {
    assert.equal(typeof tabtab.install, 'function');
  });

  it('throws on missing options', () => {
    assert.throws(() => {
      tabtab.install();
    }, TypeError);
  });

  it('throws on missing name options', () => {
    assert.throws(() => {
      tabtab.install({});
    }, TypeError);
  });

  it('throws on missing completer options', () => {
    assert.throws(
      () => {
        tabtab.install({
          name: 'foo'
        });
      },
      {
        name: /^TypeError$/,
        message: /options\.completer is required/
      }
    );
  });

  it('asks about shell (bash)', async () => {
    const cliPath = path.join(__dirname, 'fixtures/tabtab-install.js');
    const result = await run([cliPath], [ENTER, 'n', ENTER, '/tmp/foo', ENTER], TIMEOUT);
    debug('Test result', result);

    // assert.ok(/Which\sshell\sdo\syou\suse\s\?\sbash/.test(result));
    assert.ok(/Which Shell do you use \? bash/.test(result));
    assert.ok(/We will install completion to ~\/\.bashrc, is it ok \?/.test(result));
    assert.ok(/Which path then \? Must be absolute/.test(result));
    assert.ok(/Very well, we will install using \/tmp\/foo/.test(result));
    assert.ok(/Result \{ location: '\/tmp\/foo', shell: 'bash' \}/.test(result));

    return Promise.resolve();
  });
});
