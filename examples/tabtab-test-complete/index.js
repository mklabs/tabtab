#! /usr/bin/env node

const opts = require('minimist')(process.argv.slice(2), {
  string: ['foo', 'bar'],
  boolean: ['help', 'version', 'loglevel']
});

const tabtab = require('../..');

const args = opts._;

const completion = env => {
  if (!env.complete) return;

  if (env.prev === 'someCommand') {
    return tabtab.log(['is', 'this', 'the', 'real', 'life']);
  }

  if (env.prev === 'anotherOne') {
    return tabtab.log(['is', 'this', 'just', 'fantasy']);
  }

  if (env.prev === '--loglevel') {
    return tabtab.log(['error', 'warn', 'info', 'notice', 'verbose']);
  }

  return tabtab.log([
    '--help',
    '--version',
    '--loglevel',
    'foo',
    'bar',
    'install-completion',
    'uninstall-completion',
    'completion',
    'someCommand:someCommand is a some kind of command with a description',
    {
      name: 'someOtherCommand:hey',
      description: 'You must add a description for items with ":" in them'
    },
    'anotherOne'
  ]);
};

const init = async () => {
  const cmd = args[0];

  if (opts.help) {
    return console.log('Output help here');
  }

  if (opts.version) {
    return console.log('Output version here');
  }

  if (opts.loglevel) {
    return console.log('Output version here');
  }

  if (cmd === 'foo') {
    return console.log('foobar');
  }

  if (cmd === 'bar') {
    return console.log('barbar');
  }

  if (cmd === 'someCommand') {
    return console.log('is this the real life ?');
  }

  if (cmd === 'anotherOne') {
    return console.log('is this just fantasy ?');
  }

  if (cmd === 'install-completion') {
    // Here we install for the program `tabtab-test` (this file), with
    // completer being the same program. Sometimes, you want to complete
    // another program that's where the `completer` option might come handy.
    await tabtab
      .install({
        name: 'tabtab-test',
        completer: 'tabtab-test'
      })
      .catch(err => console.error('INSTALL ERROR', err));

    return;
  }

  if (cmd === 'uninstall-completion') {
    // Here we uninstall for the program `tabtab-test` (this file).
    await tabtab
      .uninstall({
        name: 'tabtab-test'
      })
      .catch(err => console.error('UNINSTALL ERROR', err));

    return;
  }

  if (cmd === 'completion') {
    const env = tabtab.parseEnv(process.env);
    return completion(env);
  }
};

init();
