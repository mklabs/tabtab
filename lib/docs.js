
var fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  Ronn = require('ronn').Ronn;

//
// Output documentation, generated from source files or markdown directly.
//
// This file is a special task file which uses [ronnjs](https://github.com/kapouer/ronnjs) to
// automatically generate manpage from the source file.
//
// It will basically output the comments of a source file, originally done to be docco compliant,
// using `man`. The source files are parsed and their markdown content is runned through ronnjs,
// then executed through the `man` executable.
//


// known markdown extensions
var markdowns = ['.md', '.markdown', '.mkd'],
  // the reg used to parse markdown from source files
  matcher = {
    coffee: /^\s*#\s?/,
    js: /^\s*\/\/\s?/
  };

// the snippet of markdown that is prepended on each file generation.
var manfront = [
  ":cmd-:page(1) -- documentation for :page",
  "==========================================================================================================",
  "",
  "## :page \n"
].join('\n');


// ### help
// Output documentation, generated from source files or markdown directly.
// If file is not a markdown extension, file content is parsed if the extension
// is known (js or coffee) and comments written in markdown are used to
// generate the man page.
//
// The cmd parameter is used only to escape the manfront that is prepended on
// each file generation.
exports.help = function(file, cmd, cb) {
  var extname = path.extname(file),
    basename = path.basename(file).replace(extname, ''),
    md = !!~markdowns.indexOf(extname);

  if(basename === 'Cakefile') extname = '.coffee';

  if(!cb) {
    cb = cmd;
    cmd = 'manman';
  }

  // noop if no callback supplied
  cb = cb || function(){};

  path.exists(file, function(state) {
    if(!state) return cb(new Error(file + ' does not exist.'));

    fs.readFile(file, 'utf8', function(err, content) {
      if(err) return cb(err);
      var ronn = md ? parseMd(content) : parse(extname, content);
      man(ronn, { page: basename, cmd: cmd }, cb);
    });
  });
};

function handleFront(input, data) {
  var front = tmpl(manfront, data);
  return front + input;
}

function tmpl(s,d){return s.replace(/:([a-z]+)/g, function(w,m){return d[m];});}

function man(output, options, cb) {
  var ronn = new Ronn(handleFront(output, options)),
    manpath = path.join(__dirname, '.man.swp');

  fs.writeFile(manpath, ronn.roff(), function(err) {
    if(err) return cb(err);

    var ch = spawn('man', [manpath], {
      // soon deprecated, will have to use stdinStream, stdoutStream, and stderrStream instead
      customFds: [process.stdin, process.stdout, process.stderr]
    });

    ch.on('exit', cb);
  });
}

function parse(ext, code) {
  var lines = code.split('\n'),
    sections = [],
    reg = matcher[ext.replace('.', '')],
    save = function (line, i, arr) {
      // push a new line if the prev line is not a comment
      if(reg && reg.test(arr[i - 2])) {
        sections.push('\n');
      }

      if(reg && reg.test(line)) {
        sections.push(line.replace(reg, ''));
      }
    };

  lines.forEach(save);

  return sections.join('\n');
}

function parseMd(content) {
  var delim = '<code>',
    delimIn = delim + 'in',
    delimOut = delim + 'out',
    code;

  content = content
    .replace(/```.+/gm, delimIn + '\n')
    .replace(/~~~.+/gm, delimIn + '\n')
    .replace(/```/gm, '\n' + delimOut)
    .replace(/~~~/gm, '\n' + delimOut);

  content = content.split('\n')
    .map(function(line) {
      if (line.match(delimIn)) {
        line = line.replace(delimIn, '');
        code = true;
      } else if(line.match(delimOut)) {
        line = line.replace(delimOut, '');
        code = false;
      }

      return code ? '    ' + line : line;
    });


  return content.join('\n');
}
