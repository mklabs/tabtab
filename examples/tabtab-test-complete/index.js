#! /usr/bin/env node

const opts = require('minimist')(process.argv.slice(2), {
  string: ['foo', 'bar'],
  boolean: ['help', 'version']
});

module.exports = opts;

const args = opts._;

// console.error('opts', opts);
// console.error('args', args);

if (opts.help) {
  return console.log('Output help here');
}

if (opts.version) {
  return console.log('Output version here');
}

if (args[0] === 'foo') {
  return console.log('foobar');
}

if (args[0] === 'bar') {
  return console.log('barbar');
}
