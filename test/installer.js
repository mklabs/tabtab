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
const { COMPLETION_DIR, TABTAB_SCRIPT_NAME } = require('../lib/constants');
const { rejects, setupSuiteForInstall } = require('./utils');

// For node 7 / 8
assert.rejects = rejects;

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

describe('installer', () => {
  it('has install / uninstall functions', () => {
    assert.equal(typeof install, 'function');
    assert.equal(typeof uninstall, 'function');
  });

  it('install rejects on missing options', async () => {
    await assert.rejects(async () => install(), /options.name is required/);
    await assert.rejects(
      async () => install({ name: 'foo ' }),
      /options.completer is required/
    );

    await assert.rejects(
      async () => install({ name: 'foo ', completer: 'foo-complete' }),
      /options.location is required/
    );
  });

  it('uninstall rejects on missing options', async () => {
    await assert.rejects(
      async () => uninstall(),
      /Unable to uninstall if options.name is missing/,
      'Uninstall should throw the expected message when name is missing'
    );
  });

  it('has writeToShellConfig / writeToCompletionScript functions', () => {
    assert.equal(typeof writeToShellConfig, 'function');
    assert.equal(typeof writeToCompletionScript, 'function');
  });

  describe('installer on ~/.bashrc', () => {
    setupSuiteForInstall(true);

    before(async () => {
      // Make sure __tabtab.bash starts with empty content, it'll be restored by setupSuiteForInstall
      await writeFile(
        untildify(path.join(COMPLETION_DIR, `${TABTAB_SCRIPT_NAME}.bash`)),
        ''
      );
    });

    it('installs the necessary line into ~/.bashrc', () =>
      install({
        name: 'foo',
        completer: 'foo-complete',
        location: '~/.bashrc'
      })
        .then(() => readFile(untildify('~/.bashrc'), 'utf8'))
        .then(filecontent => {
          assert.ok(/tabtab source for packages/.test(filecontent));
          assert.ok(/uninstall by removing these lines/.test(filecontent));
          assert.ok(
            filecontent.match(`. ${path.join(COMPLETION_DIR, '__tabtab.bash')}`)
          );
        })
        .then(() =>
          readFile(
            untildify(path.join(COMPLETION_DIR, '__tabtab.bash')),
            'utf8'
          )
        )
        .then(filecontent => {
          assert.ok(/tabtab source for foo/.test(filecontent));
          assert.ok(
            filecontent.match(`. ${path.join(COMPLETION_DIR, 'foo.bash')}`)
          );
        }));

    it('uninstalls the necessary line from ~/.bashrc and completion scripts', () =>
      uninstall({
        name: 'foo'
      })
        .then(() => readFile(untildify('~/.bashrc'), 'utf8'))
        .then(filecontent => {
          assert.ok(!/tabtab source for packages/.test(filecontent));
          assert.ok(!/uninstall by removing these lines/.test(filecontent));
          assert.ok(
            !filecontent.match(
              `. ${path.join(COMPLETION_DIR, '__tabtab.bash')}`
            )
          );
        })
        .then(() =>
          readFile(
            untildify(path.join(COMPLETION_DIR, '__tabtab.bash')),
            'utf8'
          )
        )
        .then(filecontent => {
          assert.ok(!/tabtab source for foo/.test(filecontent));
          assert.ok(
            !filecontent.match(`. ${path.join(COMPLETION_DIR, 'foo.bash')}`)
          );
        }));
  });
});
