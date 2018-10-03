const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const { promisify } = require('util');
const debug = require('./utils/tabtabDebug')('tabtab:installer');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const { BASH_LOCATION, FISH_LOCATION, ZSH_LOCATION } = require('./constants');

const shellExtension = location => {
  if (location === BASH_LOCATION) return 'bash';
  if (location === FISH_LOCATION) return 'fish';
  if (location === ZSH_LOCATION) return 'zsh';
};

const scriptFromLocation = location => {
  if (location === BASH_LOCATION) {
    return path.join(__dirname, '../scripts/bash.sh');
  }

  if (location === FISH_LOCATION) {
    return path.join(__dirname, '../scripts/fish.sh');
  }

  if (location === ZSH_LOCATION) {
    return path.join(__dirname, '../scripts/zsh.sh');
  }
};

const writeToShellConfig = ({ name, location }) => {
  debug(`Adding tabtab script to ${location}`);
  const filename = path.join(
    __dirname,
    '../.completions',
    `${name}.${shellExtension(location)}`
  );
  debug('Which filename', filename);

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(untildify(location), { flags: 'a' });
    stream.on('error', reject);
    stream.on('finish', () => resolve());

    debug('Writing to shell configuration file (%s)', location);
    stream.write(`\n# tabtab source for ${name} package`);
    stream.write('\n# uninstall by removing these lines');

    if (location === BASH_LOCATION) {
      stream.write(`\n[ -f ${filename} ] && . ${filename} || true`);
    } else if (location === FISH_LOCATION) {
      debug('Addding fish line');
      stream.write(`\n[ -f ${filename} ]; and . ${filename}; or true`);
    } else if (location === ZSH_LOCATION) {
      debug('Addding zsh line');
      stream.write(`\n[[ -f ${filename} ]] && . ${filename} || true`);
    }

    stream.end('\n');
  });
};

const writeToCompletionScript = ({ name, completer, location }) => {
  const filename = path.join(
    __dirname,
    '../.completions',
    `${name}.${shellExtension(location)}`
  );

  const script = scriptFromLocation(location);
  debug('Writing completion script to', filename);
  debug('with', script);

  return readFile(script, 'utf8')
    .then(filecontent =>
      filecontent
        .replace(/\{pkgname\}/g, name)
        .replace(/{completer}/g, completer)
        // on Bash on windows, we need to make sure to remove any \r
        .replace(/\r?\n/g, '\n')
    )
    .then(filecontent => writeFile(filename, filecontent));
};

const installer = {
  install(options = { name: '', completer: '', location: '' }) {
    debug('Install with options', options);
    if (!options.name) {
      throw new TypeError('options.name is required');
    }

    if (!options.completer) {
      throw new TypeError('options.completer is required');
    }

    if (!options.location) {
      throw new TypeError('options.location is required');
    }

    return Promise.all([
      writeToShellConfig(options),
      writeToCompletionScript(options)
    ]);
  },

  uninstall(options = { name: '' }) {
    debug('Uninstall with options', options);
    throw new Error('Not yet implemented');
  },

  writeToShellConfig,
  writeToCompletionScript
};

module.exports = installer;
