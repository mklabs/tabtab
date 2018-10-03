#! /usr/bin/env node

const opts = require('minimist')(process.argv.slice(2), {
  string: ['foo', 'bar'],
  boolean: ['help', 'version']
});

const tabtab = require('../..');

module.exports = opts;

const args = opts._;

const completion = env => {
  if (/^--/.test(env.prev)) {
    return tabtab.log(['--help', '--foo', '--bar'], env);
  }

  if (env.prev === 'tabtab') {
    return tabtab.log([
      '--help',
      '--version',
      'foo',
      'bar',
      'install-completion',
      'completion',
      'someCommand',
      'anotherOne'
    ]);
  }

  if (env.prev === 'someCommand') {
    return tabtab.log(['is', 'this', 'the', 'real', 'life']);
  }

  if (env.prev === 'anotherOne') {
    return tabtab.log(['is', 'this', 'just', 'fantasy']);
  }

  return tabtab.log('foo', 'bar');
};

const init = () => {
  const cmd = args[0];

  if (opts.help) {
    return console.log('Output help here');
  }

  if (opts.version) {
    return console.log('Output version here');
  }

  if (cmd === 'foo') {
    return console.log('foobar');
  }

  if (cmd === 'bar') {
    return console.log('barbar');
  }

  if (cmd === 'install-completion') {
    return console.log('install completion there');
  }

  if (cmd === 'someCommand') {
    return console.log('is this the real life ?');
  }

  if (cmd === 'anotherOne') {
    return console.log('is this just fantasy ?');
  }

  if (cmd === 'completion') {
    const env = tabtab.parseEnv(process.env);
    return completion(env);
  }
};

init();
