const debug = require('./debug')('tabtab:installer')


import fs from                'fs'
import path from              'path'
import inquirer from          'inquirer';
import { spawn, exec } from   'child_process';

// Public: Manage installation / setup of completion scripts.
//
// pkg-config --variable=completionsdir bash-completion
// pkg-config --variable=compatdir bash-completion
export default class Installer {
  constructor(options, complete) {
    this.options = options || {};
    debug('init', this.options);
    this.complete = complete;
  }

  // Called on install command.
  //
  // Performs the installation process.
  handle(name) {
    debug('handle', name);
    this.options.name = name;

    return this.prompt()
      .then(this.writeTo.bind(this));
  }

  writeTo(data) {
    var destination = data.destination;
    debug('Installing completion script to %s directory', destination);

    var script = this.complete.script(this.options.name, this.options.name);

    if (destination === 'stdout') return process.stdout.write('\n\n' + script + '\n');

    var out = this.createStream(destination);
  }

  createStream(destination, options) {
    if (destination === 'bashrc') destination = path.join(this.home, '.bashrc');
    else if (destination === 'zshrc') destination = path.join(this.home, '.zshrc');
    else destination = path.join(destination, this.options.name);

    return new Promise((r, errback) => {
      debug('Check %s destination', destination);

      var flags = 'a';
      fs.stat(destination, (err, stat) => {
        if (err && err.code === 'ENOENT') flags = 'w';
        else if (err) return errback(err);

        debug('Installing completion script to %s directory', destination);
        debug('Writing to %s file in %s mode', destination, flags === 'a' ? 'append' : 'write');

        var out = fs.createWriteStream(destination, { flags });

        out.on('error', (err) => {
          if (err.code === 'EACCES') {
            return console.error(`
Error: You don't have permission to write to ${destination}. Try running with sudo instead:

    sudo ${process.argv.join(' ')}

`);
          }

          throw err;
        });

      });
    });
  }

  get home() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  // Prompts user for installation location.
  prompt() {
    var choices = [{
      name:   'Nowhere. Just output to STDOUT',
      value:  'stdout',
      short:  'stdout'
    }, {
      name:   '~/.bashrc',
      value:  'bashrc',
      short:  'bash'
    }, {
      name:   '~/.zshrc',
      value:  'zshrc',
      short:  'zsh'
    }];

    var prompts = [{
      message: 'Where do you want to setup the completion script',
      name: 'destination',
      type: 'list',
      choices: choices
    }];

    return this.completionsdir()
      .then((dir) => {
        if (dir) {
          choices.push({
            name: dir,
            value: dir,
          });
        }

        return this.compatdir();
      })
      .then((dir) => {
        if (dir) {
          choices.push({
            name: dir,
            value: dir
          });
        }

        return this.ask(prompts);
      });
  }

  ask(prompts) {
    debug('Ask', prompts);
    return inquirer.prompt(prompts);
  }

  // Public: pkg-config wrapper
  pkgconfig(variable) {
    return new Promise((r, errback) => {
      var cmd = `pkg-config --variable=${variable} bash-completion`;
      exec(cmd, function(err, stdout, stderr) {
        if (err) return errback(err);
        stdout = stdout.trim();
        debug('Got %s for %s', stdout, variable);
        r(stdout);
      });
    });
  }

  // Returns the pkg-config variable for "completionsdir" and bash-completion
  // command.
  completionsdir() {
    debug('Asking pkg-config for completionsdir');
    return this.pkgconfig('completionsdir');
  }

  // Returns the pkg-config variable for "compatdir" and bash-completion
  // command.
  compatdir() {
    debug('Asking pkg-config for compatdir');
    return this.pkgconfig('compatdir');
  }
}
