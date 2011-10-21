
var fs = require('fs'),
  path = require('path'),
  args = process.argv.slice(2),
  complete = args[0] === 'completion',
  words = process.env.COMP_CWORD,
  point = process.env.COMP_POINT,
  line = process.env.COMP_LINE;

// check bin/pkgrc for usage example.
//
// Run `<pkgname> completion` for install instruction.
// Run `<pkgname> completion >> datauri completion >> ~/.bashrc` (or ~/.zshrc)
//
// Simply log in the callback to show completion output.

exports.complete = function(name, completer, cb) {

  // cb not there, assume callback is completer and
  // the completer is the executable itself
  if(!cb) {
    cb = completer;
    completer = name;
  }

  // if not a complete command, return here.
  if(!complete) return cb();

  // if the COMP_* are not in the env, then dump the install script.
  if(!words || !point || !line) return script(name, completer, cb);

  var partial = line.substr(0, point),
  last = line.split(' ').slice(-1).join(''),
  lastPartial = partial.split(' ').slice(-1).join(''),
  prev = line.split(' ').slice(0, -1).slice(-1)[0];

  cb(null, {
    line: line,
    words: words,
    point: point,
    partial: partial,
    last: last,
    prev: prev,
    lastPartial: lastPartial
  });
};

// simple helper function to know if the script is run
// in the context of a completion command. Also mapping the
// special `<pkgname> completion` cmd.
exports.isComplete = function() {
  return complete || (words && point && line);
};

// output the completion.sh script to the console for install instructions.
// This is actually a 'template' where the package name is used to setup
// the completion on the right command, and properly name the bash/zsh functions.
function script (name, completer, cb) {
  var p = path.resolve(__dirname, 'completion/completion.sh');

  fs.readFile(p, 'utf8', function (er, d) {
    if (er) return cb(er);
    d = d
      .replace(/\{pkgname\}/g, name)
      .replace(/{completer}/g, completer);
    console.log(d);
    cb();
  });
}

