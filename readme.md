# tabtab [![Build Status](https://secure.travis-ci.org/mklabs/node-tabtab.png)](http://travis-ci.org/mklabs/node-tabtab)

An npm package to do some custom command line`<tab><tab>` completion for
any system command.

Using the node api and JS to provide your own completion, for both bash/zsh shell.

Made possible using the same technique as npm (whose completion is quite
awesome) relying on a bash/zsh completion shell script bridge to do the
actual completion from node's land.

## Install

Latest released version (when it'll get released)

    npm install tabtab

## Features

> wip

- Binary to manage and discover completion
- Automatic completion from help output
- `tabtab install` in package.json install script creates the completion file on user system
- Automatic completion with package.json `completion|tabtab` property

## Example

You can add completion pretty easily in your node cli script:

```js
var tab = require('tabtab')();

tab.on('complete', function(data, done) {
  // General handler
  done(null, ['foo', 'bar']);
});

// yourbin command completion
//
// Ex. yourbin list
tab.on('list', function(data, done) {
  done(null, ['file.js', 'file2.js']);
});
```

These events are emitted whenever the command `completion -- ..` is triggered.

The `data` object holds interesting value to drive the output of the
completion:

* `line`: full command being completed
* `words`: number of word
* `point`: cursor position
* `partial`: tabing in the middle of a word: foo bar baz bar foobar<tab><tab>rrrrrr
* `last`: last word of the line
* `lastPartial`: last partial of the line
* `prev`: the previous word

## Completion Install

Installing the completion for your cli app is done very much [like npm
does](https://docs.npmjs.com/cli/completion):

    . <(pkgname completion)

It'll enables tab-completion for the `pkgname` executable. Adding it to
your ~/.bashrc or ~/.zshrc will make the completions available
everywhere (not only the current shell).

## CLI

tabtab provides a binary to manage and discover completion on the user system.
It provides utilities for install, removing a completion file, to discover and
enable additional completion etc.


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


### tabtab install

    $ tabtab install --help

    Options:
      --zshrc                 Source completion in ~/.zshrc
      --bashrc                Source completion in ~/.bashrc
      --auto                  Let tabtab check for user environment to edit
                              either zshrc or bashrc
      --system                Use /etc/bash_completion.d system directory

      --console               Outputs script to console and writes nothing

This command lets you source the completion script to a particular place.
Defaults is to use `/etc/bash_completion.d` dir if it exists, and fallback to
~/.bashrc or ~/.zshrc files.

### tabtab uninstall

    $ tabtab uninstall foobar

Attemps to uninstall a previous tabtab install. `tabtab install` adds an entry
to an internal registry of completions, to be able to undo the operation on
uninstall.

### tabtab ...

- tabtab list
- tabtab search
- tabtab add
- tabtab rm/remove

## npm scripts

Using npm's install/uninstall script, you can automatically manage completion
for your program whenever it gets globally installed or removed.

```json
{
  "scripts": {
    "install": "tabtab install",
    "uninstall": "tabtab uninstall"
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
    "install": "tabtab install",
    "uninstall": "tabtab uninstall"
  },
  "dependencies": {
    "tabtab": "^1.0.0"
  }
}
```

It will writes the output of `tabtab completion --name foobar` to
`/etc/bash_completion.d/foobar` and enable completion for your program
automatically whenever a user install your package, and undo the operation if
removed.

## API

> old stuff

### complete

Main completion method, has support for installation and actual completion.

    tabtab.complete(completed, completer, callback);


* completed: name of the command to complete
* completer: *Optional* name of the command to call on completion (when
  not set, completed and completer are the same)
* callback: get called when a tab-completion command  happens.

completed and completer are there only to set up and build the correct
bash/zsh script, based on the `lib/completion.sh` template (which is
based on npm's completion shell script)

### log

Helper to return completion output and log to standard output.

    tabtab.log(['list', 'of', 'values'], data, prefix);

* values: Array of values to complete against.
* data: the data object returned by the complete callback, used mainly
  to filter results accordingly upon the text that is supplied by the
  user.
* prefix: *Optional* a prefix to add to the completion results, useful
  for options to add dashes (eg. `-` or `--`).

### parseOut

Helper to return the list of short and long options, parsed from the
usual `--help` output of a command (cake/rake -H, vagrant, commander -h,
optimist.help(), ...)

    var parsed = completion.parseOut(optimist.help());
    console.log(parsed.shorts);
    console.log(parsed.longs);

Using a spawned process:

    exec('rake -H', function(err, stdout, stderr) {
      if(err) return;
      var parsed = parseOut(stdout);
      if(/^--\w?/.test(o.last)) return log(parsed.longs, data, '--');
      if(/^-\w?/.test(o.last)) return log(parsed.shorts, data, '-');
    });

### parseTasks

same purpose as parseOut, but for parsing tasks from an help command
(cake/rake -T, vagrant, etc.)

  exec('cake', function(err, stdout, stderr) {
    if(err) return;
    var parsed = tasks = parseTasks(stdout, 'cake');
    log(tasks, o);
  });

* stdout: string of help output.
* prefix: prefix used internally to build the RegExp that is used to
  parse tasks from stdout.

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

