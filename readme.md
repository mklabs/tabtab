## tabtab

[![Build
Status](https://secure.travis-ci.org/mklabs/node-tabtab.png)](http://travis-ci.org/mklabs/node-tabtab)

An npm package to do some custom command line`<tab><tab>` completion for
any system command, using the node api and JS to provide your own
completion, for both bash/zsh shell.

Made possible using the same technique as npm (whose completion is quite
awesome) relying on a bash/zsh completion shell script bridge to do the
actual completion from node's land.

### Install

Latest released version (when it'll get released)

    npm install tabtab

Latest dev code:

    npm install https://github.com/mklabs/node-tabtab/tarball/master

### Examples

You can add completion pretty easily in your node cli script:

    #!/usr/bin/env node
    var tabtab = require('tabtab');

    if(process.argv.slice(2)[0] === 'completion') return tabtab.complete('pkgname', function(err, data) {
      // simply return here if there's an error or data not provided.
      // stderr not showing on completions
      if(err || !data) return;

      if(/^--\w?/.test(data.last)) return tabtab.log(['help', 'version'], data, '--');
      if(/^-\w?/.test(data.last)) return tabtab.log(['n', 'o', 'd', 'e'], data, '-');

      tabtab.log(['list', 'of', 'commands'], data);
    });

    // The rest of your script
    ...

Simply replace `pkgname` by the name of your package. The complete
callback get's called with data only in the context of a completion
command.

The `data` object holds interesting value to drive the output of the
completion:

* `line`: full command being completed
* `words`: number of word
* `point`: cursor position
* `partial`: tabing in the middle of a word: foo bar baz bar foobar<tab><tab>rrrrrr
* `last`: last word of the line
* `lastPartial`: last partial of the line
* `prev`: the previous word

#### completion install

Installing the completion for your cli app is done very much [like npm
does](http://npmjs.org/doc/completion.html):

    . <(pkgname completion)

It'll enables tab-completion for the `pkgname` executable. Adding it to
your ~/.bashrc or ~/.zshrc will make the completions available
everywhere (not only the current shell).

## API

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
it not already.

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

