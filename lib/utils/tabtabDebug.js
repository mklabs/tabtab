const fs = require('fs');
const util = require('util');

/**
 * If TABTAB_DEBUG env is set, make it so that debug statements are also log to
 * TABTAB_DEBUG file provided.
 */
const tabtabDebug = name => {
  /* eslint-disable global-require */
  let debug = require('debug')(name);

  if (process.env.TABTAB_DEBUG) {
    const file = process.env.TABTAB_DEBUG;
    const stream = fs.createWriteStream(file, {
      flags: 'a+'
    });

    const log = (...args) => {
      args = args.map(arg => {
        if (typeof arg === 'string') return arg;
        return JSON.stringify(arg);
      });

      const str = `${util.format(...args)}\n`;
      stream.write(str);
    };

    if (process.env.COMP_LINE) {
      debug = log;
    } else {
      debug.log = log;
    }
  }

  return debug;
};

module.exports = tabtabDebug;
