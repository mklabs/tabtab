const fs = require('fs');
const util = require('util');

/**
 * If TABTAB_DEBUG env is set, make it so that debug statements are also log to
 * TABTAB_DEBUG file provided.
 */
const tabtabDebug = name => {
  /* eslint-disable global-require */
  const debug = require('debug')(name);

  if (process.env.TABTAB_DEBUG) {
    const stream = fs.createWriteStream(process.env.TABTAB_DEBUG, {
      flags: 'a+'
    });

    debug.log = (...args) => {
      args = args.map(arg => {
        if (typeof arg === 'string') return arg;
        return JSON.stringify(arg);
      });

      const str = `${util.format(...args)}\n`;
      console.log(str);
      stream.write(str);
    };
  }

  return debug;
};

module.exports = tabtabDebug;
