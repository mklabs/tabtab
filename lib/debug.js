const fs    = require('fs');
const path  = require('path');
const util = require('util');

let out = fs.createWriteStream(process.env.TABTAB_DEBUG || '/tmp/tabtab.log', {
  flags: 'a'
});

module.exports = function debug() {
  // console.log('write', util.format.apply(util, arguments));
  out.write(util.format.apply(util, arguments) + '\n');
}
