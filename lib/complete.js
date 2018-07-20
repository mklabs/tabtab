const fs         = require('fs');
const path       = require('path');
const read       = fs.readFileSync;
const exists     = fs.existsSync;
const join       = path.join;
const debug      = require('./debug')('tabtab:complete');
const uniq       = require('lodash.uniq');
const difference = require('lodash.difference');
const { EventEmitter } = require('events');

// Public: Complete class. This is the main API to interract with the
// completion system and extends EventEmitter.
//
// Examples
//
//   const complete = new Complete({
//     name: 'binary-name'
//   });
//
//   complete.on('list', function(data, done) {
//     return done(null, ['completion', 'result', 'here']);
//   });
module.exports = class Complete extends EventEmitter {

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
    this.options.name = this.options.name || this.resolve('name');

    this._results = [];
    this._completions = [];
  }

  start() {
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
    options = Object.assign({}, options, this.options);
    const name = options.name.trim();
    if (!name) throw new Error('Cannot determine package name');

    const env = this.env = this.parseEnv(options);
    if (env.args[0] !== 'completion') return;

    debug('handle: options', options);
    debug('handle: env', env);
    debug('handle: env.line', env.line);

    // Check if we have all required COMP args there, env.complete will turn
    // false if any of these is missing.
    if (!env.complete) {
      return debug('Completion command but without COMP args');
    }

    debug('complete package', env);
    this.completePackage(env);

    const event = env.line.trim();

    // We now emit the whole line, instead of emitting several events at once
    debug('Sending events', event);
    debug('With env', env);
    this.send(event, env, (err, results) => {
      debug('send, received results', results);
      this.output(results);
    });

    // but ALWAYS trigger the original event based on options.name
    this.send(name, env, (err, results) => {
      debug('send, received results based on options.name', results);
      this.output(results);
    });
  }

  output(results) {
    debug('TEST results', results);
    const shell = (process.env.SHELL || '').split('/').slice(-1)[0];

    if (shell === 'bash') {
      results = results.filter((res) => {
        return res.indexOf(this.env.last) === 0;
      });
    }

    // create a duplicate-free version of results
    results = uniq(results);

    // only include results different from past completion results
    results = difference(results, this._completions);
    this._completions = this._completions.concat(results);

    debug('results:', results, this.env);
    console.log(results.join('\n'));
  }

  // Little helper to emit events
  send(evt, env, done) {
    debug('Emit event (%s)', evt);
    const res = this.emit(evt, env, done);
    return res;
  }

  // Lookup for package.json with a tabtab property, which determines the
  // completion items.
  completePackage(env, stop) {
    const config = this.resolve('tabtab');
    if (!config) return;

    const pkgname = config[this.options.name];
    const last = (env.last || env.prev).trim();
    const prop = last || this.options.name;
    if (!prop) return;

    if (stop) {
      let first = env.line.split(' ')[0];
      let results = config[first];
      if (!results) return;
      return this.recv(null, results, env);
    }

    // Keeps looking up for completion only if previous one have not returned
    // any results.
    const command = config[prop];
    const completions = this.recv(null, command, env);

    if (!completions) {
      if (last && !stop) {
        let reg = new RegExp('\\s*' + last + '\\s*$');
        let line = env.line.replace(reg, '');
        this.completePackage(this.parseEnv({
          env: {
            COMP_LINE: line,
            COMP_WORD: env.words,
            COMP_POINT: env.point
          }
        }), true);
      }
    }

    return true
  }

  // Public: Completions handlers
  //
  // will call back this function with an Array of completion items.
  //
  // err -          Error object
  // completions -  The Array of String completion results to write to stdout
  // env -          Env object as parsed by parseEnv
  recv(err, completions, env) {
    if (!completions) return;

    env = env || this.env;

    debug('TEST Received %s', completions);
    if (err) return this.emit('error', err);

    this.addCompletions(completions);
    this.output(this._results);

    return completions;
  }

  addCompletions(completions) {
    completions = Array.isArray(completions) ? completions : [completions];
    const shell = (process.env.SHELL || '').split('/').slice(-1)[0];

    completions = completions.map(this.completionItem).map((item) => {
      return shell === 'zsh' ? `${item.name.replace(/:/g, '\\:')}:${item.description}` :
        shell === 'fish' ? `${item.name}\t${item.description}` :
        item.name;
    });

    this._results = this._results.concat(completions);
    debug('this_results in addCompletions', this._results);
    debug('process.env.SHELL', shell);
  }

  completionItem(str) {
    debug('!!completion item', str, typeof str);

    if (typeof str !== 'string') return str;
    const shell = (process.env.SHELL || '').split('/').slice(-1)[0];

    const parts = str.split(/(\\)?:/);
    let desc = parts.slice(-1)[0];
    let name = parts[0];

    if (desc === name) {
      desc = '';
    }

    if (shell === 'zsh' && /\\/.test(str)) {
      name = name + '\\';
    }

    return {
      name: name,
      description: desc
    };
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
  //   const env = complete.parseEnv();
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
    options = options || {}
    options = Object.assign({}, options, this.options);
    const args = options._ || process.argv.slice(2);
    const env = options.env || process.env;

    let cword = Number(env.COMP_CWORD);
    let point = Number(env.COMP_POINT);
    const line = env.COMP_LINE || '';

    if (isNaN(cword)) cword = 0;
    if (isNaN(point)) point = 0;

    const partial = line.slice(0, point);

    const parts = line.split(' ');
    const prev = parts.slice(0, -1).slice(-1)[0];

    const last = parts.slice(-1).join('');
    const lastPartial = partial.split(' ').slice(-1).join('');

    let complete = args[0] === 'completion';
    if (!env.COMP_CWORD || typeof env.COMP_POINT === 'undefined' || typeof env.COMP_LINE === 'undefined') {
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
  script(name, completer, shell) {
    return read(join(__dirname, `../scripts/${shell || 'completion'}.sh`), 'utf8')
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
  resolve(prop) {
    // `module` is special node builtin
    const parent = this.findParent(module);
    if (!parent) return;

    let dirname = path.dirname(parent.filename);

    // was invoked by cli tabtab, fallback to local package.json
    if (parent.filename === path.join(__dirname, '../bin/tabtab')) {
      dirname = path.resolve();
    }

    const jsonfile = this.findUp('package.json', dirname);
    if (!jsonfile) return;

    return require(jsonfile)[prop];
  }
}
