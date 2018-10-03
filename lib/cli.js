// This file is just there to test out the completion with tabtab itself

const debug = require('debug')('tabtab');
const fs = require('fs');
const util = require('util');
const opts = require('minimist')(process.argv.slice(2));
const tabtab = require('..');

const argv = opts._;
const env = tabtab.parseEnv(opts, process.env);

const tabtabDebug = () => {
  if (process.env.TABTAB_DEBUG) {
    const stream = fs.createWriteStream(process.env.TABTAB_DEBUG, {
      flags: 'a+'
    });

    debug.log = (...args) => {
      args = args.map(arg => {
        if (typeof arg === 'string') return arg;
        return JSON.stringify(arg);
      });

      stream.write(`${util.format(...args)}\n`);
    };
  }
};

const init = () => {
  if (argv[0] === 'completion' && !env.complete) {
    return console.log('do nothing');
  }

  console.error(env);
  if (argv[0] === 'completion' && env.complete) {
    if (/^--/.test(env.prev)) {
      return tabtab.log(['--help', '--foo', '--bar'], env);
    }

    if (env.prev === 'tabtab') {
      return tabtab.log(
        ['someCommand', 'anotherOne', 'generator:app', 'generator:view'],
        env
      );
    }

    if (env.prev === 'someCommand') {
      return tabtab.log(['is', 'this', 'the', 'real', 'life'], env);
    }

    if (env.prev === 'anotherOne') {
      return tabtab.log(['is', 'this', 'just', 'fantasy'], env);
    }

    if (env.prev === 'generator') {
      return tabtab.log(
        ['generator:app', 'generator:view', 'generator:foo', 'generator:meow'],
        env
      );
    }

    return tabtab.log('foo', 'bar');
  }
};

tabtabDebug();
init();
