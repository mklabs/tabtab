// const debug  = require('debug')('tabtab:complete');
const fs     = require('fs');
const path   = require('path');
const read   = fs.readFileSync;
const exists = fs.existsSync;
const join   = path.join;
const debug  = require('./debug');

const { EventEmitter } = require('events');

class Complete extends EventEmitter {

  // Defaults
  get defaults() {
    return {
      name: process.title !== 'node' ? process.title : ''
    };
  }

  // Constructor: Extends EventEmitter, accepts options hash with:
  //
  // - name - the package beeing completed name, defaults to process.title (if
  // not node default) or will attempt to determine parent's package.json
  // location and extract the name from it
  constructor(options) {
    super();
    this.options = options || this.defaults;

    if (!this.options.name) {
      this.resolveName();
    }

    this.handle();
  }


  // Main handler
  //
  // Responsible for the `completion` command, both in normal and "plumbing"
  // mode.
  handle(options) {
    options = options || this.options;
    var env = this.parseEnv(this.options);

    var name = options.name;
    if (!name) throw new Error('Cannot determine package name');

    if (env.args[0] !== 'completion') return;

    debug('Completion plumbing mode detected');
    if (!env.complete) {
      debug('Completion command but without COMP args. Will output script:', name);
      return console.log(this.script(name, name));
    }

    debug('Trigger completion', env.line);
    var line = env.line.replace(name, '').trim();
    var first = line.split(' ')[0];

    if (first) {
      first = first.trim();
      debug('Emit "%s" event', first);
      process.nextTick(() => {
        this.emit(first, env, this.recv.bind(this));
      });
    }

    debug('Emit "%s" general event', name);
    process.nextTick(() => {
      this.emit(name, env, this.recv.bind(this));
    });
  }

  // Completions callback
  //
  // completions handlers will call back this function with an Array of
  // completion items.
  recv(err, completions) {
    debug('Completion results', err, completions);
    if (err) return this.emit('error', err);
    completions = Array.isArray(completions) ? completions : [completions];
    console.log(completions.join(' '));
  }

  // Main utility to extract information from command line arguments and
  // Environment variables, namely COMP args in "plumbing" mode.
  parseEnv(options) {
    options = Object.assign({}, options, this.options);
    var args = options._ || process.argv.slice(2);
    var env = options.env || process.env;

    var cword = Number(env.COMP_CWORD);
    var point = Number(env.COMP_POINT);
    var line = env.COMP_LINE || '';

    if (isNaN(cword)) cword = 0;
    if (isNaN(point)) point = 0;

    var partial = line.slice(0, point);

    var parts = line.split(' ');
    var prev = parts.slice(0, -1).slice(-1)[0];

    var last = parts.slice(-1).join('');
    var lastPartial = partial.split(' ').slice(-1).join('');

    var complete = args[0] === 'completion';

    if (!env.COMP_CWORD || !env.COMP_POINT || typeof env.COMP_LINE === 'undefined') {
      complete = false;
    }

    return {
      args: args,

      // whether we act in "plumbing mode" or not
      complete: complete,

      // number of words
      words: cword,

      // cursor position
      point: point,

      // input line
      line: line,

      // part of line preceding point
      partial: partial,

      // last word of the line
      last: last,

      // last word of partial
      lastPartial: lastPartial,

      // word preceding last
      prev: prev || ''
    };
  }

  // Script templating helper
  //
  // Outputs npm's completion script with pkgname and completer placeholder
  // replaced.
  script(name, completer) {
    return read(join(__dirname, '../scripts/completion.sh'), 'utf8')
      .replace(/\{pkgname\}/g, name)
      .replace(/{completer}/g, completer);
  }

  // Recursively walk up the `module.parent` chain to find original file.
  findParent(module, last) {
    if (!module.parent) return module;
    return this.findParent(module.parent);
  }

  // Recursively walk up the directories, untill it finds the `file` provided,
  // or reach the user $HOME dir.
  findUp(file, dir) {
    dir = path.resolve(dir || './');

    // stop at user $HOME dir
    if (dir === process.env.HOME) return;
    if (exists(join(dir, file))) return join(dir, file);
    return this.findUp(file, path.dirname(dir));
  }

  // When options.name is not defined, this gets called to attempt to determine
  // completer name.
  resolveName() {
    // `module` is special node builtin
    var parent = this.findParent(module);
    if (!parent) return;

    var jsonfile = this.findUp('package.json', path.dirname(parent.filename));
    if (!jsonfile) return;

    this.options.name = require(jsonfile).name;
  }
}

module.exports = Complete;
