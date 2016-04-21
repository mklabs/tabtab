const debug    = require('debug')('tabtab:commands');
const { join } = require('path');

const {
  readFileSync: read,
  existsSync: exists
} = require('fs');

class Commands {

  get completion() {
    return read(join(__dirname, '../../scripts/completion.sh'), 'utf8')
  }

  // Fow now, just output to the console
  install() {
    var script = this.completion;
    console.log(this.completion);
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
