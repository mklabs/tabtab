const assert = require('assert');
const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const { promisify } = require('es6-promisify');
const {
  install,
  uninstall,
  writeToShellConfig,
  writeToCompletionScript
} = require('../lib/installer');

const readFile = promisify(fs.readFile);

describe('installer', () => {
  it('has install / uninstall functions', () => {
    assert.equal(typeof install, 'function');
    assert.equal(typeof uninstall, 'function');
  });

  it('both throws on missing options', () => {
    assert.throws(() => install(), /options.name is required/);
    assert.throws(
      () => install({ name: 'foo ' }),
      /options.completer is required/
    );

    assert.throws(
      () => install({ name: 'foo ', completer: 'foo-complete' }),
      /options.location is required/
    );
  });

  it('has writeToShellConfig / writeToCompletionScript functions', () => {
    assert.equal(typeof writeToShellConfig, 'function');
    assert.equal(typeof writeToCompletionScript, 'function');
  });

  describe('installer on ~/.bashrc', () => {
    const bashrc = fs.readFileSync(untildify('~/.bashrc'));

    afterEach(done => {
      fs.writeFile(untildify('~/.bashrc'), bashrc, done);
    });

    it('installs the necessary line into ~/.bashrc', () =>
      install({
        name: 'foo',
        completer: 'foo-complete',
        location: '~/.bashrc'
      })
        .then(() => readFile(untildify('~/.bashrc'), 'utf8'))
        .then(filecontent => {
          assert.ok(/tabtab source for completion packages/.test(filecontent));
          assert.ok(/uninstall by removing these lines/.test(filecontent));
          assert.ok(
            /\[ -f .+__tabtab.bash ] && \. .+tabtab\/.completions\/__tabtab.bash || true/.test(
              filecontent
            )
          );
        })
        .then(() =>
          readFile(
            path.join(__dirname, '../.completions/__tabtab.bash'),
            'utf8'
          )
        )
        .then(filecontent => {
          assert.ok(/tabtab source for foo/.test(filecontent));
          assert.ok(
            /\[ -f .+foo.bash ] && \. .+tabtab\/.completions\/foo.bash || true/.test(
              filecontent
            )
          );
        }));
  });
});
