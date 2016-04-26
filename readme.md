# tabtab [![Build Status](https://secure.travis-ci.org/mklabs/node-tabtab.png)](http://travis-ci.org/mklabs/node-tabtab) ![v1.0.0-pre](https://img.shields.io/badge/version-1.0.0-green.svg)

A node package to do some custom command line`<tab><tab>` completion for any
system command, for Bash, Zsh, and Fish shells.

Made possible using the same technique as npm (whose completion is quite
awesome) relying on a shell script bridge to do the actual completion from
node's land.

---

- Supports **zsh**, **fish** and **bash**
- CLI tool to manage and discover completion.
- Automatic completion from `package.json` config
- Or using an EventEmitter based API
- Manual or Automatic installation using system dirs (ex. `/usr/share/bash-completion/completions` for bash).
- A way to install completion script for a given shell on `npm install`, gently
  asking the user for install location.
  - `tabtab install` in package.json install script creates the completion file on user system.

---

<!-- toc -->
* [Install](#install)
* [Documentation](#documentation)
  * [API](#api)
  * [package.json](#packagejson)
* [Completions](#completions)
  * [Manual Installation](#manual-installation)
  * [Automatic Installation](#automatic-installation)
    * [npm script:install](#npm-scriptinstall)
  * [Completion description](#completion-description)
  * [Completion for other programs](#completion-for-other-programs)
    * [nvm](#nvm)
    * [Bower](#bower)
    * [Yeoman](#yeoman)
* [CLI](#cli)
  * [tabtab install](#tabtab-install)
* [Credits](#credits)
<!-- toc stop -->

## Install

    npm install tabtab --save

## Documentation

### API

You can add completion pretty easily in your node cli script:

```js
// Ex. bin/ entry point for a "program" package
var tab = require('tabtab')();

// General handler. Gets called on `program <tab>` and `program stuff ... <tab>`
tab.on('program', function(data, done) {
  // General handler
  done(null, ['foo', 'bar']);
});

// Specific handler. Gets called on `program list <tab>`
tab.on('list', function(data, done) {
  done(null, ['file.js', 'file2.js']);
});

// Start must be called to register the completion commands and listen for
// completion.
tab.start();
```

These events are emitted whenever the command `program completion -- ..` is
triggered, with special `COMP_*` environment variables.

`tab.start()` will define one command: `completion` for your program, which is
used by the Shell completion scripts.

The `data` object holds interesting value to drive the output of the
completion:

* `line`: full command being completed
* `words`: number of word
* `point`: cursor position
* `partial`: tabing in the middle of a word: foo bar baz bar foobar<tab><tab>rrrrrr
* `last`: last word of the line
* `lastPartial`: last partial of the line
* `prev`: the previous word

### package.json

While the EventEmitter API can offer fine control over what gets completed,
completion values can be defined directly in the `package.json` file, using the
`tabtab` property:

```js
{
  "tabtab": {
    "nvm": ["help", "use", "install", "uninstall", "run", "current", "ls", "ls-remote"],
    "use": ["stable", "default", "iojs", "v5.11.0", "v6.0.0"]
  }
}
```

This still requires to initialize tabtab with:

```js
require('tabtab')().start();
```

## Completions

### Manual Installation

Manually loading the completion for your cli app is done very much [like npm
does](https://docs.npmjs.com/cli/completion):

    . <(tabtab install --stdout --name program)

It'll enables tab-completion for the `program` executable. Adding it to your
~/.bashrc or ~/.zshrc will make the completions available everywhere (not only
the current shell).

    tabtab install --stdout --name program >> ~/.bashrc # or ~/.zshrc

This requires an additional manual step for the user. Ideally we'd want it to
be automatic, and define it at a system-level.

### Automatic Installation

For completions to be active for a particular command/program, the user shell
(bash, zsh or fish) must load a specific file when the shell starts.

Each shell have its own system, and different loading paths. `tabtab` tries to
figure out the most appropriate directory depending on the `$SHELL` variable.

- **fish**  Uses `~/.config/fish/completions`
- **zsh**  Uses `/usr/local/share/zsh/site-functions`
- **bash** Asks `pkg-config` for completion directories if bash-completion is
  installed (defaults to `/usr/share/bash-completion/completions` and
  `/etc/bash_completion.d`)

`tabtab` CLI provides an `install` command to ease the process of installing a
completion script when the package is installed on the user system, using npm
script.

#### npm script:install

Using npm's install/uninstall script, you can automatically manage completion
for your program whenever it gets globally installed or removed.

```json
{
  "scripts": {
    "install": "tabtab install"
  }
}
```

On install, npm will execute the `tabtab install` command automatically in the
context of your package.

Ex.

```json
{
  "name": "foobar",
  "bin": "bin/foobar",
  "scripts": {
    "install": "tabtab install"
  },
  "dependencies": {
    "tabtab": "^1.0.0"
  }
}
```

Nothing is done's without asking confirmation, `tabtab install` looks at the
`$SHELL` variable to determine the best possible locations and uses
[Inquirer](https://github.com/SBoudrias/Inquirer.js/) to ask the user what it
should do:

![bash](./docs/img/bash-install.png)
![zsh](./docs/img/zsh-install.png)
![fish](./docs/img/fish-install.png)

### Completion description

> todo: zsh / fish offers the ability to define description with each
> completion item, implemented with fish, have to adjust the same pattern to
> zsh.


### Completion for other programs

#### nvm

The `--completer` option allows you to delegate the completion part to another
program. Let's take nvm as an example.

The idea is to create a package named `nvm-complete`, with an executable that
loads `tabtab` and handle the completion output of `nvm-complete completion`.

```json
{
  "name": "nvm-complete",
  "bin": "./index.js",
  "scripts": {
    "install": "tabtab install --name nvm --completer nvm-complete"
  },
  "dependencies": {
    "tabtab": "^1.0.0"
  }
}
```

```js
// index.js
var tabtab = require('tabtab');

tabtab.on('nvm', function(data, done) {
  return done(null, ['ls', 'ls-remote', 'install', 'use', ...]);
});

tabtab.start();
```

Alternatively, we can use tabtab property in package.json file to define static
list of completion results:

```json
{
  "tabtab": {
    "nvm": ["help", "use", "install", "uninstall", "run", "current", "ls", "ls-remote"],
    "use": ["stable", "default", "iojs", "v5.11.0", "v6.0.0"]
  }
}
```

For more control over the completion results, the JS api is useful for
returning specific values depdending on preceding words, like completing each
node versions on `nvm install <tab>`.

```js
var exex = require('child_process').exec;

// To cache the list of versions returned by ls-remote
var versions = [];
tabtab.on('install', function(data, done) {
  if (versions.length) return done(null, versions);

  // Ask nvm the list of remote, and return each as a completion item
  exec('nvm ls-remote', function(err, stdout) {
    if (err) return done(err);
    versions = versions.concat(stdout.split(/\n/));
    return done(null, versions);
  });
});
```

On global installation of `nvm-complete`, the user will be asked for
installation instruction (output to stdout, write to shell config, or a system
dir). The completion should be active on reload or next login (close / reopen
your terminal).

#### Bower

**[examples/bower-complete](./examples/bower-complete#readme)**

![bower-complete](http://i.imgur.com/KH3VQWU.png)

#### Yeoman

**[examples/yo-complete](./examples/yo-complete#readme)**

![yo](http://i.imgur.com/LQYxCbZ.png)

![yo](http://i.imgur.com/yCjK3tJ.png)

## CLI

tabtab(1) - manage and discover completion on the user system.

It provides utilities for installing a completion file, to discover and
enable additional completion etc.


    $ tabtab <command> [options]

    Options:
      -h, --help              Show this help output
      -v, --version           Show package version

    Commands:

      install                 Install and enable completion file on user system

<!--- uninstall               Undo the install command --->
<!--- list                    List the completion files managed by tabtab --->
<!--- search                  Search npm registry for tabtab completion files / dictionaries --->
<!--- add                     Install additional completion files / dictionaries --->
<!--- rm/remove               Uninstall completion file / dictionnary --->


### tabtab install

    $ tabtab install --help

    Options:
      --stdout                Outputs script to console and writes nothing
      --name                  Program name to complete
      --completer             Program that drives the completion (default: --name)


Triggers the installation process and asks user for install location. `--name`
if not defined, is determined from `package.json` name property. `--completer`
can be used to delegate the completion to another program. Ex.

    $ tabtab install --name bower --completer bower-complete

<!--- ### tabtab uninstall --->
<!---  --->
<!---     $ tabtab uninstall foobar --->
<!---  --->
<!--- Attemps to uninstall a previous tabtab install. `tabtab install` adds an entry --->
<!--- to an internal registry of completions, to be able to undo the operation on --->
<!--- uninstall. --->

`tabtab install` is not meant to be run directly, but rather used with your
`package.json` scripts.

## Credits

npm does pretty amazing stuff with its completion feature. Bash and zsh
provides command tab-completion, which allow you to complete the names
of commands in your $PATH.  Usually these functions means bash
scripting, and in the case of npm, it is partially true.

There is a special `npm completion` command you may want to look around,
if not already.

    npm completion

Running this should dump [this
script](https://raw.github.com/isaacs/npm/caafb7323708e113d100e3e8145b949ed7a16c22/lib/utils/completion.sh)
to the console. This script works with both bash/zsh and map the correct
completion functions to the npm executable. These functions takes care
of parsing the `COMP_*` variables available when hitting TAB to complete
a command, set them up as environment variables and run the `npm
completion` command followed by `-- words` where words match value of
the command being completed.

This means that using this technique npm manage to perform bash/zsh
completion using node and JavaScript. Actually, the comprehensiveness of npm
completion is quite amazing.

This whole package/module is based entirely on npm's code and @isaacs
work.

---

> [MIT](./LICENSE) &nbsp;&middot;&nbsp;
> [mkla.bz](http://mkla.bz) &nbsp;&middot;&nbsp;
> [@mklabs](https://github.com/mklabs)
