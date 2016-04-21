// const debug = require('debug')('tabtab:commands');
const fs    = require('fs');
const path  = require('path');
const join  = path.join;
const debug = require('../debug');

const Complete = require('../complete');

const {
  readFileSync: read,
  existsSync: exists
} = require('fs');

class Commands {


  get allowed() {
    return ['install', 'uninstall', 'list', 'search', 'add', 'rm', 'completion'];
  }

  // Constructor
  constructor(options) {
    this.options = options || {};
    this.complete = new Complete(this.options);
  }

  // Commands

  // Fow now, just output to the console
  install(options) {
    options = options || {};
    var script = this.complete.script(this.name, this.name || 'tabtab');
    console.log(script);
  }

  completion(options) {
    options = options || this.options;
    return this.complete.handle(options);
  }

  uninstall() {}
  search() {}
  list() {}
  add() {}
  rm() {}

  help() {
    return `
    $ tabtab <command> [options]

    Options:
      -h, --help              Show this help output
      -v, --version           Show package version
      -s, --silent            Silent mode for commands like install
      -y, --yes               Skips confirmation prompts

    Commands:

      install                 Install and enable completion file on user system
      uninstall               Undo the install command
      list                    List the completion files managed by tabtab
      search                  Search npm registry for tabtab completion files / dictionaries
      add                     Install additional completion files / dictionaries
      rm/remove               Uninstall completion file / dictionnary
    `;
  }
}

module.exports = new Commands();
