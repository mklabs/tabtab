const debug    = require('./debug')('tabtab');
const minimist = require('minimist');
const Commands = require('./commands');

const opts = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version'
  }
});

const cmd = opts._[0];

const commands = new Commands(opts);
const allowed = commands.allowed;

if (opts.help) {
  console.log(commands.help());
  process.exit(0);
} else if (opts.version) {
  console.log(commands.help());
  process.exit(0);
} else if (allowed.indexOf(cmd) !== -1) {
  // debug('Run command %s with options', cmd, opts);
  commands[cmd](opts);
} else {
  console.log(commands.help());
}
