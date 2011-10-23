a npm package to ease the process of doing custom command line tab completion on any commands, for both bash/zsh shell.

Made possible using the same technique as npm (whose completion is quite awesome) relying on a bash/zsh completion script bridge to a node script.

If you'd like to implement some completion for your own nodejs cli app,
or maybe any other command on your system (think not necessaraly an npm
package) using regular JavaScript instead of bash scripting, this repository can help you.

Comes with built-in completion examples for:

* rake: tasks/options
* cake: tasks/options
* vagrant: 
* ...

And a more generally purpose example doing completion with some of the
most robust and well-known options parsing and cli modules:

* [nopt](https://github.com/isaacs/nopt)
* [optimist](https://github.com/substack/node-optimist)
* [commander.js](https://github.com/visionmedia/commander.js)

The main modules include some basic helpers for parsing help output (where
in most of cases it is enough to get sensitive informations on the process
being completed), and logging completion filtered on the text being
completed.

### install

Latest released version (when it'll get released)

    npm install tabtab -g

Latest dev code:

    npm install https://github.com/mklabs/node-tabtab/tarball/master -g

Or
    git clone https://github.com/mklabs/node-tabtab.git
    cd tabtab
    npm link

### setting up a new completion

To install follow the installation instructions in the `completer completion` 
output or `completer`. A completer is one of the script in `bin/`, that
gets linked to your $PATH by npm during global install or link.

You simply need to redirect the output of the command in your 
~/.basrc or ~/.zshrc file. Example for completing tasks and options for
cake

    cake-completer completion >> ~/.bashrc
    # or if zsh
    cake-completer completion >> ~/.zshrc

Then, make sure to open a new shell session to make sure the
.bashrc/.zshrc file is loaded, or do it manually by running `source ~/.bashrc` (or
.zshrc).

npm completion is pretty amazing and would allow you to discover some
options and commands you might not know about.

### using it in node cli app

You can add completion pretty easily in your node cli script:

    #!/usr/bin/env node
    var completion = require('../lib/completion'), // todo: replace this the package name
      exec = require('child_process').exec,
      path = require('path'),
      completer = path.basename(__filename);

    completion.complete('pkgname', function(err, data) {
      // simply return here if there's an error or data not provided.
      // stderr not showing on completions
      if(err || !data) return;

      if(/^--\w?/.test(data.last)) return completion.log(['help', 'version'], data, '--');
      if(/^-\w?/.test(data.last)) return completion.log(['n', 'o', 'd', 'e'], data, '-');

      completion.log(['list', 'of', 'commands'], data);
    });

    // prevent main script from running when called on completion
    if(completion.isComplete()) return;

    // The rest of your script
    ...

Simply replace `pkgname` by the name of your package (not yet
implemented: or pass in the module reference, package name will be read
from the package.json).

The complete callback get's called with data only in the context of a
completion command, and the main script should be run only when it's not
a completion command.

The `data` object holds interesting value to drive the output of the
completion:

* line: full command being completed
* words: number of word
* point: cursor position
* partial: tabing in the middle of a word: foo bar baz bar foobar<tab><tab>rrrrrr
* last: last word of the line
* lastPartial: last partial of the line
* prev: the previous word

Installing the completion for your cli app is done very much like npm:

    pkgname completion >> ~/.bashrc (or ~/.zshrc)

### installing examples completion

The `bin` folders includes some completion example for cake, rake and
vagrant.

## API

- After you put it in an accessible place, run it with the `--install` option. This will install a series of bash scripts in the `/usr/local/lib/node_scripts/` directory. Optionally, you can then add a script to your CLI program to ensure that it has been `installed`.

### complete

Main completion method, has support for installation and actual completion.

```javascript
completion.complete(completed, completer, callback);
```

* completed: name of the command to complete
* completer: *Optional* name of the command to call on completion (when
  not set, completed and completer are the same)
* callback that will get called when the match when the completion happens.

completed and completer are there only to set up and build the correct
bash/zsh script, based on the `lib/completion/completion.sh` template.

### log

Helper to return completion output and log to standard output.

```javascript
completion.log(['list', 'of', 'values'], data, prefix);
```

* values: Array of values to complete
* data: the data returned by the complete callback, used mainly to
  filter results accordingly upon the text that is supplied by the user.
* prefix: *Optional* a prefix to add to the completion results, useful
  for options to add dashes (eg. `-` or `--`)

### parseOut

Helper to return the list of short and long options, parsed from the
usual `--help` output of a command (cake/rake -H, vagrant, commander -h, 
optimist.help(), ...)

```javascript
var parsed = completion.parseOut(optimist.help());
console.log(parsed.shorts);
console.log(parsed.longs);
```

Using a spawned process:

```javascript
return exec('rake -H', function(err, stdout, stderr) {
  if(err) return;
  var parsed = parseOut(stdout);
  if(/^--\w?/.test(o.last)) return log(parsed.longs, o, '--');
  if(/^-\w?/.test(o.last)) return log(parsed.shorts, o, '-');
});
```

### parseTasks

same purpose as parseOut, but for parsing tasks from an help command
(cake/rake -T, vagrant, etc.)

```javascript
exec('cake', function(err, stdout, stderr) {
  if(err) return;
  var parsed = tasks = parseTasks(stdout, 'cake');
  log(tasks, o);
});
```

* stdout: string of help output
* prefix: prefix used internally to build the RegExp that is used to
  parse tasks from stdout.

## Credits

npm does pretty amazing stuff with its completion feature. Bash and 
zsh shells allow command completion, typically bound to the TAB key,
which allow you to complete the names of commands stored upon your PATH.
Usually these functions means bash scripting, and in the case of npm, it
is partially true. 

There is a special `npm completion` command you may want to look around, it not already.

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
completion using node and JavaScript. Actually, the completeness of npm
completion is quite amazing.

This whole package/module is based entirely on npm's code and @isaacs
work.

