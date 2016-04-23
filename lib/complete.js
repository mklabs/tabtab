const fs     = require('fs');
const path   = require('path');
const read   = fs.readFileSync;
const exists = fs.existsSync;
const join   = path.join;
const debug  = require('./debug')('tabtab:complete')
const { EventEmitter } = require('events');

// Public: Complete class. This is the main API to interract with the
// completion system and extends EventEmitter.
//
// Examples
//
//   var complete = new Complete({
//     name: 'binary-name'
//   });
//
//   complete.on('list', function(data, done) {
//     return done(null, ['completion', 'result', 'here']);
//   });
class Complete extends EventEmitter {

  // Public: Options defaults.
  //
  // Returns the binary name being completed. Uses process.title if not the
  // default "node" value, or attempt to determine the package name from
  // package.json file.
  get defaults() {
    return {
      name: process.title !== 'node' ? process.title : ''
    };
  }

  // Public: Complete constructor, accepts options hash with
  //
  // options -  Accepts options hash (default: {})
  //
  // Examples
  //
  //   new Complete({
  //     // the String package name being completed, defaults to process.title
  //     // (if not node default) or will attempt to determine parent's
  //     // package.json location and extract the name from it.
  //     name: 'foobar'
  //   });
  constructor(options) {
    super();
    this.options = options || this.defaults;
    this.options.name = this.options.name || this.resolveName();

    this.handle();
  }

  // Public: Takes care of all the completion plumbing mechanism.
  //
  // It checks the environment to determine if we act in plumbing mode or not,
  // to parse COMP args and emit the appropriated events to gather completion
  // results.
  //
  // options - options hash to pass to self#parseEnv
  handle(options) {
    debug('handle');
    options = options || this.options;
    var env = this.parseEnv(this.options);

    var name = options.name;
    if (!name) throw new Error('Cannot determine package name');

    if (env.args[0] !== 'completion') return;

    debug('Completion plumbing mode detected');
    if (!env.complete) {
      return debug('Completion command but without COMP args');
    }

    debug('Trigger completion', env.line);
    var line = env.line.replace(name, '').trim();
    var first = line.split(' ')[0];
    if (first) first = first.trim();

    debug('first', first);
    debug('env', env);

    var event = first || env.prev || name;
    debug('Emit "%s" event', event);

    process.nextTick(() => {
      // Keeps emitting event only if previous one is not being listend. Emits
      // in series: first, prev and name.
      this.send(event, env, this.recv.bind(this))
      || this.send(env.prev, env, this.recv.bind(this))
      || this.send(name, env, this.recv.bind(this));
    });

    // TODO: Check if this event is eventually needed
    //
    // debug('Emit "%s" general event', name);
    // process.nextTick(() => {
    //   this.emit(name, env, this.recv.bind(this));
    // });
  }

  send(evt, env, done) {
    debug('Emit evt:', evt);
    return this.emit(evt, env, done);
  }

  // Public: Completions handlers
  //
  // will call back this function with an Array of completion items.
  //
  // err -          Error object
  // completions -  The Array of String completion results to write to stdout
  recv(err, completions) {
    debug('Completion results', err, completions);
    if (err) return this.emit('error', err);
    completions = Array.isArray(completions) ? completions : [completions];
    console.log(completions.join('\n'));
  }

  // Public: Main utility to extract information from command line arguments and
  // Environment variables, namely COMP args in "plumbing" mode.
  //
  // options -  The options hash as parsed by minimist, plus an env property
  //            representing user environment (default: { env: process.env })
  //    :_      - The arguments Array parsed by minimist (positional arguments)
  //    :env    - The environment Object that holds COMP args (default: process.env)
  //
  // Examples
  //
  //   var env = complete.parseEnv();
  //   // env:
  //   // args        the positional arguments used
  //   // complete    A Boolean indicating whether we act in "plumbing mode" or not
  //   // words       The Number of words in the completed line
  //   // point       A Number indicating cursor position
  //   // line        The String input line
  //   // partial     The String part of line preceding cursor position
  //   // last        The last String word of the line
  //   // lastPartial The last word String of partial
  //   // prev        The String word preceding last
  //
  // Returns the data env object.
  parseEnv(options) {
    options = options || {};
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
      complete: complete,
      words: cword,
      point: point,
      line: line,
      partial: partial,
      last: last,
      lastPartial: lastPartial,
      prev: prev || ''
    };
  }

  // Public: Script templating helper
  //
  // Outputs npm's completion script with pkgname and completer placeholder
  // replaced.
  //
  // name     - The String package/binary name
  // complete - The String completer name, usualy the same as name above. Can
  //            differ to delegate the completion behavior to another command.
  //
  // Returns the script content with placeholders replaced
  script(name, completer) {
    return read(join(__dirname, '../scripts/completion.sh'), 'utf8')
      .replace(/\{pkgname\}/g, name)
      .replace(/{completer}/g, completer);
  }

  // Public: Recursively walk up the `module.parent` chain to find original file.
  findParent(module, last) {
    if (!module.parent) return module;
    return this.findParent(module.parent);
  }

  // Public: Recursively walk up the directories, untill it finds the `file`
  // provided, or reach the user $HOME dir.
  findUp(file, dir) {
    dir = path.resolve(dir || './');

    // stop at user $HOME dir
    if (dir === process.env.HOME) return;
    if (exists(join(dir, file))) return join(dir, file);
    return this.findUp(file, path.dirname(dir));
  }

  // Public: package name resolver.
  //
  // When options.name is not defined, this gets called to attempt to determine
  // completer name.
  //
  // It'll attempt to follow the module chain and find the package.json file to
  // determine the command name being completed.
  resolveName() {
    debug('Complete resolve name');
    // `module` is special node builtin
    var parent = this.findParent(module);
    if (!parent) return;

    var dirname = path.dirname(parent.filename);

    // was invoked by cli tabtab, fallback to local package.json
    if (parent.filename === path.join(__dirname, '../bin/tabtab')) {
      dirname = path.resolve();
    }

    var jsonfile = this.findUp('package.json', dirname);
    if (!jsonfile) return;

    return require(jsonfile).name;
  }
}

module.exports = Complete;
