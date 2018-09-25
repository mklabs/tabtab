#! /usr/bin/env node

if (process.env.SHELL.includes('bash')) {
  process.env.DEBUG = process.env.DEBUG || 'tabtab*';
}

const debug = require('debug')('tabtab-test');
const tabtab = require('../..');
const tabtabOptions = {
  name: 'tabtab-test',
  completer: 'tabtab-test-complete',
  cache: false
};
const completer = tabtab(tabtabOptions);
const installer = new tabtab.Commands(tabtabOptions);

const opts = require('./');
const env = process.env;
const environment = completer.parseEnv({ ...opts, env });
completer.env = environment;
debug(environment);

if (opts._[0] === 'install') {
  return installer.install({
    auto: true
  });
}

// Actual completion
if (opts._[0] === 'completion') {
  const completions = [
    '--help:show help output',
    '--version:show version',
    '--help-files:show list of files',
    'foo:foobar',
    'bar:barbar',
  ];

  completer.addCompletions(completions);

  completer.addCompletions([
    '--version-system:show system version'
  ]);

  completer.output();

  return;
}

completer.start();
