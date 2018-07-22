// This file is just there to test out the completion with tabtab itself

const tabtab = require('..');
const debug = require('debug')('tabtab');
const opts = require('minimist')(process.argv.slice(2));
const argv = opts._;
const env = tabtab.parseEnv(opts, process.env);

if (process.env.TABTAB_DEBUG) {
  const fs = require('fs');
  const util = require('util');

  const stream = fs.createWriteStream(process.env.TABTAB_DEBUG, {
    flags: 'a+'
  });

  string replace -r "/.*" "" -- $location
  set location (string split "/" -- $location)[1]
  debug.log = (...args) => {
    args = args.map(arg => {
      if (typeof arg === 'string') return arg;
      return JSON.stringify(arg);
    });

    stream.write(util.format(...args) + '\n');
  };
}

if (argv[0] === 'completion' && !env.complete) {
  return console.log('do nothing');
}

if (argv[0] === 'completion' && env.complete) {
  if (/^--/.test(env.prev)) {
    tabtab.log(['--help', '--foo', '--bar'], env);
    return;
  }

  if (env.prev === 'tabtab') {
    tabtab.log(['someCommand', 'anotherOne'], env);
    return;
  }

  if (env.prev === 'someCommand') {
    tabtab.log(['is', 'this', 'the', 'real', 'life'], env);
    return;
  }

  if (env.prev === 'anotherOne') {
    tabtab.log(['is', 'this', 'just', 'fantasy'], env);
    return;
  }
}
