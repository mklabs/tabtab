const tabtab = require('..');
const assert = require('assert');
const run = require('inquirer-test');
const debug = require('debug')('tabtab:test:install');
const untildify = require('untildify');
const path = require('path');
const fs = require('fs');
const { promisify } = require('es6-promisify');

const readFile = promisify(fs.readFile);

// inquirer-test needs a little bit more time, or my setup
const TIMEOUT = 500;
const { ENTER } = run;

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
    }, /options\.name is required/);
  });

  it('throws on missing completer options', () => {
    assert.throws(() => {
      tabtab.install({
        name: 'foo'
      });
    }, /options\.completer is required/);
  });

  describe('tabtab.install() on ~/.bashrc', () => {
    const bashrc = fs.readFileSync(untildify('~/.bashrc'));

    afterEach(done => {
      fs.writeFile(untildify('~/.bashrc'), bashrc, done);
    });

    it('asks about shell (bash)', () => {
      const cliPath = path.join(__dirname, 'fixtures/tabtab-install.js');

      return run(
        [cliPath],
        [ENTER, 'n', ENTER, '/tmp/foo', ENTER],
        TIMEOUT
      ).then(result => {
        debug('Test result', result);

        assert.ok(/Which Shell do you use \? bash/.test(result));
        assert.ok(
          /We will install completion to ~\/\.bashrc, is it ok \?/.test(result)
        );
        assert.ok(/Which path then \? Must be absolute/.test(result));
        assert.ok(/Very well, we will install using \/tmp\/foo/.test(result));
      });
    });

    it('asks about shell (bash) with default location', () => {
      const cliPath = path.join(__dirname, 'fixtures/tabtab-install.js');

      return run([cliPath], [ENTER, ENTER], TIMEOUT)
        .then(result => {
          debug('Test result', result);

          assert.ok(/Which Shell do you use \? bash/.test(result));
          assert.ok(
            /install completion to ~\/\.bashrc, is it ok \? Yes/.test(result)
          );
        })
        .then(() => readFile(untildify('~/.bashrc'), 'utf8'))
        .then(filecontent => {
          assert.ok(/tabtab source for completion packages/.test(filecontent));
          assert.ok(/uninstall by removing these lines/.test(filecontent));
          assert.ok(
            /\[ -f .+foo.bash ] && \. .+tabtab\/.completions\/foo.bash || true/.test(
              filecontent
            )
          );
        });
    });
  });
});
