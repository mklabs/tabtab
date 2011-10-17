
var path = require('path'),
fs = require('fs');

// ## config
//
// Only dealing with global/local configuration. Will lookup a
// configuration: .namerc where name is the package name (as defined in
// package.json)
//
// This file will lookup config files at the two following places:
//
// * ${pwd}/.namerc (local)
// * ~/.namerc (global)
//

module.exports = function config(name, dir) {
  if(!name) throw new Error('config: must provide a packagename: ');
  //if(path.existsSync(dir)) throw new Error('Unable to locate dir: ' + dir);

  var file = '.' + name + 'rc',
  local = path.join(dir || process.cwd(), '.' + name + 'rc'),
  global = path.join(process.env.HOME, '.' + name + 'rc');

  // todo: fallback with defaults or something
  if(!path.existsSync(local)) console.warn('No Local config');
  if(!path.existsSync(global)) console.warn('no Global config');

  local = local ? parse(local) : {};
  global = global ? parse(global) : {};

  var merged = extend({}, global, local);
  return merged;
};


function parse(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {
    throw new Error('JSON not JavaScript ! Unable to parse your configuration file.');
  }
}


function extend (obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source){
    for (var prop in source) {
      if (source[prop] !== undefined) obj[prop] = source[prop];
    }
  });
  return obj;
}
