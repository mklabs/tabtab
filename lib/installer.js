const debug = require('./debug')('tabtab:installer')


import path from 'path'
import inquirer from 'inquirer';
import { spawn, exec } from 'child_process';

// Public: Manage installation / setup of completion scripts.
//
// pkg-config --variable=completionsdir bash-completion
// pkg-config --variable=compatdir bash-completion
export default class Installer {
  constructor(options) {
    this.options = options || {};
    debug('init', this.options);
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

    if (destination === 'bashrc') destination = path.join(this.home, '.bashrc');
    else if (destination === 'zshrc') destination = path.join(this.home, '.zshrc');
    else destination = path.join(destination, this.options.name);

    debug('Installing completion script to %s directory', destination);

  }

  get home() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  // Prompts user for installation location.
  prompt() {
    var choices = [{
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
