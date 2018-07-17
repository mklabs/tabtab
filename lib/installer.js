const debug           = require('./debug')('tabtab:installer')
const fs              = require('fs');
const path            = require('path');
const inquirer        = require('inquirer');
const { spawn, exec } = require('child_process');
const mkdirp          = require('mkdirp');

let errmsg = `
Error: You don't have permission to write to :destination.
Try running with sudo instead:

  sudo ${process.argv.join(' ')}
`;

// Public: Manage installation / setup of completion scripts.
module.exports = class Installer {
  get home() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  constructor(options, complete) {
    this.options = options || {};
    this.complete = complete;

    this._shell = (process.env.SHELL || '').split('/').slice(-1)[0];
    this.dest = this._shell === 'zsh' ? 'zshrc' :
      this._shell === 'bash' ? 'bashrc' :
      'fish';

    this.dest = this.dest.replace('~', process.env.HOME);
  }

  // Called on install command.
  //
  // Performs the installation process.
  handle(name, options) {
    this.options.name = name;

    if (options.stdout) return new Promise((r, errback) => {
      return this.writeTo({
        destination: 'stdout'
      });
    });

    if (options.auto) {
      this.template = this._shell;
      return this.writeTo({ destination: this.dest });
    }

    return this.prompt().then(this.writeTo.bind(this));
  }

  writeTo(data) {
    var destination = data.destination;
    debug('Installing completion script to %s file or directory', destination);

    var script = this.complete.script(this.options.name, this.options.completer || this.options.name, this.template);

    if (destination === 'stdout') return process.stdout.write('\n\n' + script + '\n');

    if (destination === 'bashrc') destination = path.join(this.home, '.bashrc');
    else if (destination === 'zshrc') destination = path.join(this.home, '.zshrc');
    else if (destination === 'fish') destination = path.join(this.home, '.config/fish/config.fish');
    else if (destination === 'fishdir') destination = path.join(this.home, '.config/fish/completions', this.options.name + '.fish');
    else destination = path.join(destination, this.options.name);

    return new Promise(this.createStream.bind(this, destination))
      .then(this.installCompletion.bind(this, destination));
  }

  createStream(destination, r, errback) {
    // debug('Check %s destination', destination);
    var flags = 'a';
    fs.stat(destination, (err, stat) => {
      if (err && err.code === 'ENOENT') flags = 'w';
      else if (err) return errback(err);

      mkdirp(path.dirname(destination), (err) => {
        if (err) return errback(err);

        var out = fs.createWriteStream(destination, { flags });
        out.on('error', (err) => {
          if (err.code === 'EACCES') {
            console.error(errmsg.replace(':destination', destination));
          }
          return errback(err);
        });

        out.on('open', () => {
          debug('Installing completion script to %s directory', destination);
          debug('Writing to %s file in %s mode', destination, flags === 'a' ? 'append' : 'write');
          r(out);
        });
      });
    });
  }

  installCompletion(destination, out) {
    const name = this.options.name;
    var script = this.complete.script(name, this.options.completer || name, this.template).replace(/\r\n/g, '\n'); // replace windows style line end no matter what, can cause issue
    var filename = path.join(__dirname, '../.completions', name + '.' + this.template);
    if(process.platform === 'win32') { filename = filename.replace(/\\/g, '/'); } // win32: replace backslashes with forward slashes
    debug('Writing actual completion script to %s', filename);

    // First write internal completion script in a local .comletions directory
    // in this module. This gets sourced in user scripts after, to avoid
    // cluttering bash/zshrc files with too much boilerplate.
    return new Promise((r, errback) => {
      fs.writeFile(filename, script, (err) => {
        if (err) return errback(err);

        var regex = new RegExp(`tabtab source for ${name}`);
        fs.readFile(destination, 'utf8', (err, content) => {
          if (err) return errback(err);
          if (regex.test(content)) {
            return debug('Already installed %s in %s', name, destination);
          }

          console.error('\n[tabtab] Adding source line to load %s\nin %s\n', filename, destination);

          debug('. %s > %s', filename, destination);
          out.write('\n# tabtab source for ' + name + ' package');
          out.write('\n# uninstall by removing these lines or running ');
          out.write('`tabtab uninstall ' + name + '`');

          if (this.template === 'fish') {
            out.write('\n[ -f ' + filename + ' ]; and . ' + filename + '; or true');
          } else if (this.template === 'zsh') {
            out.write('\n[[ -f ' + filename + ' ]] && . ' + filename + ' || true');
          } else {
            out.write('\n[ -f ' + filename + ' ] && . ' + filename + ' || true');
          }
        });
      });
    });
  }

  uninstallCompletion(destination) {
    return new Promise((r, errback) => {
      fs.readFile(destination, 'utf8', (err, body) => {
        if (err) return errback(err);
        r(body);
      });
    })

    .then((body) => {
      var lines = body.split(/\r?\n/);

      debug('Uninstall', this.options);
      var name = this.options.name;
      var reg = new RegExp('(tabtab source for ' + name + ' package|`tabtab uninstall ' + name + '`|tabtab/.completions/' + name + ')');
      lines = lines.filter((line) => {
        return !reg.test(line);
      });

      return lines.join('\n');
    })

    .then((content) => {
      return new Promise((r, errback) => {
        fs.writeFile(destination, content, (err) => {
          if (err) return errback(err);
          debug('%s sucesfully updated to remove tabtab', destination);
        });
      });
    });
  }

  // Prompts user for installation location.
  prompt() {
    var choices = [{
      name:   'Nowhere. Just output to STDOUT',
      value:  'stdout',
      short:  'stdout'
    }];

    var prompts = [{
      message: 'Where do you want to setup the completion script',
      name: 'destination',
      type: 'list',
      choices: choices
    }];

    return this.shell()
      .then((entries) => {
        prompts[0].choices = choices.concat(entries);
        return inquirer.prompt(prompts);
      });
  }

  // Shell adapters.
  //
  // Supported:
  //
  // - bash   - Asks pkg-config for completion directories
  // - zsh    - Lookup $fpath environment variable
  // - fish   - Lookup for $fish_complete_path
  shell() {
    return new Promise((r, errback) => {
      var shell = process.env.SHELL;
      if (shell) shell = shell.split((process.platform !== 'win32') ? '/' : '\\').slice(-1)[0];

      return this[shell]().then(r)
        .catch(errback);
    });
  }

  fish() {
    debug('Fish shell detected');
    this.template = 'fish';
    return new Promise((r, errback) => {
      var dir = path.join(this.home, '.config/fish/completions');
      return r([{
        name: 'Fish config file (~/.config/fish/config.fish)',
        value: 'fish',
        short: 'fish'
      }, {
        name: 'Fish completion directory (' + dir + ')',
        value: 'fishdir',
        short: 'fish'
      }]);
    });
  }

  bash() {
    debug('Bash shell detected');
    this.template = 'bash';
    var entries = [{
      name:   'Bash config file (~/.bashrc)',
      value:  'bashrc',
      short:  'bash'
    }];

    return new Promise((resolve, reject) => resolve(entries));
  }

  zsh() {
    debug('Zsh shell detected');
    this.template = 'zsh';
    return new Promise((r, errback) => {
      var dir = '/usr/local/share/zsh/site-functions';
      return r([{
        name:   'Zsh config file (~/.zshrc)',
        value:  'zshrc',
        short:  'zsh'
      }, {
        name: 'Zsh completion directory (' + dir + ')',
        value: dir
      }]);
    });
  }
}
