const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const { promisify } = require('es6-promisify');
const mkdirp = require('mkdirp');
const debug = require('./utils/tabtabDebug')('tabtab:installer');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const { BASH_LOCATION, FISH_LOCATION, ZSH_LOCATION } = require('./constants');

/**
 * Little helper to return the correct file extension based on the SHELL script
 * location.
 *
 * @param {String} location - Shell script location
 * @returns The correct file extension for the given SHELL script location
 */
const shellExtension = location => {
  if (location === BASH_LOCATION) return 'bash';
  if (location === FISH_LOCATION) return 'fish';
  if (location === ZSH_LOCATION) return 'zsh';
};

/**
 * Helper to return the correct script template based on the SHELL script
 * location
 *
 * @param {String} location - Shell script location
 * @returns The template script content
 */
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

/**
 * Checks a given file for the existence of a specific line. Used to prevent
 * adding multiple completion source to SHELL scripts.
 *
 * @param {String} filename - The filename to check against
 * @param {String} line     - The line to look for
 * @returns {Boolean} true or false, false if the line is not present.
 */
const checkFilenameForLine = async (filename, line) => {
  debug('Check filename (%s) for "%s"', filename, line);

  let filecontent = '';
  try {
    filecontent = await readFile(untildify(filename), 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return console.error(
        'Got an error while trying to read from %s file',
        filename,
        err
      );
    }
  }

  return !!filecontent.match(`${line}`);
};

/**
 * Opens a file for modification adding a new `source` line for the given
 * SHELL. Used for both SHELL script and tabtab internal one.
 *
 * @param {Object} options - Options with
 *    - filename: The file to modify
 *    - scriptname: The line to add sourcing this file
 *    - location: The SHELL script location
 *    - name: The package being configured
 */
const writeLineToFilename = ({ filename, scriptname, location, name }) => (
  resolve,
  reject
) => {
  const filepath = untildify(filename);

  debug('Creating directory for %s file', filepath);
  mkdirp(path.dirname(filepath), err => {
    if (err) {
      return reject(err);
    }

    const stream = fs.createWriteStream(filepath, { flags: 'a' });
    stream.on('error', reject);
    stream.on('finish', () => resolve());

    debug('Writing to shell configuration file (%s)', filename);
    debug('scriptname:', scriptname);

    stream.write(`\n# tabtab source for ${name} package`);
    stream.write('\n# uninstall by removing these lines');

    if (location === BASH_LOCATION) {
      stream.write(`\n[ -f ${scriptname} ] && . ${scriptname} || true`);
    } else if (location === FISH_LOCATION) {
      debug('Addding fish line');
      stream.write(`\n[ -f ${scriptname} ]; and . ${scriptname}; or true`);
    } else if (location === ZSH_LOCATION) {
      debug('Addding zsh line');
      stream.write(`\n[[ -f ${scriptname} ]] && . ${scriptname} || true`);
    }

    stream.end('\n');

    console.log('Added tabtab source line in "%s" file', filename);
  });
};

/**
 * Writes to SHELL config file adding a new line, but only one, to the SHELL
 * config script. This enables tabtab to work for the given SHELL.
 *
 * @param {Object} options - Options object with
 *    - location: The SHELL script location (~/.bashrc, ~/.zshrc or
 *    ~/.config/fish/config.fish)
 *    - name: The package configured for completion
 */
const writeToShellConfig = async ({ location, name }) => {
  const scriptname = path.join(
    __dirname,
    '../.completions',
    `__tabtab.${shellExtension(location)}`
  );

  const filename = location;

  // Check if SHELL script already has a line for tabtab
  const existing = await checkFilenameForLine(
    filename,
    scriptname
  );
  if (existing) {
    return console.log('Tabtab line already exists in %s file', filename);
  }

  return new Promise(
    writeLineToFilename({
      filename,
      scriptname,
      location,
      name
    })
  );
};

/**
 * Writes to tabtab internal script that acts as a frontend router for the
 * completion mechanism, in the internal .completions/ directory. Every
 * completion is added to this file.
 *
 * @param {Object} options - Options object with
 *    - location: The SHELL script location (~/.bashrc, ~/.zshrc or
 *    ~/.config/fish/config.fish)
 *    - name: The package configured for completion
 */
const writeToTabtabScript = async ({ name, location }) => {
  const filename = path.join(
    __dirname,
    '../.completions',
    `__tabtab.${shellExtension(location)}`
  );

  const scriptname = path.join(
    __dirname,
    '../.completions',
    `${name}.${shellExtension(location)}`
  );

  // Check if tabtab completion file already has this line in it
  const existing = await checkFilenameForLine(
    filename,
    scriptname
  );
  if (existing) {
    return console.log('Tabtab line already exists in %s file', filename);
  }

  return new Promise(
    writeLineToFilename({ filename, scriptname, location, name })
  );
};

/**
 * This writes a new completion script in the internal `.completions/`
 * directory. Depending on the SHELL used (and the location parameter), a
 * different script is created for the given SHELL.
 *
 * @param {Object} options - Options object with
 *    - name: The package configured for completion
 *    - completer: The binary that will act as the completer for `name` program
 *    - location: The SHELL script location (~/.bashrc, ~/.zshrc or
 *    ~/.config/fish/config.fish)
 */
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

/**
 * Top level install method. Does three things:
 *
 * - Writes to SHELL config file, adding a new line to tabtab internal script.
 * - Creates or edit tabtab internal script
 * - Creates the actual completion script for this package.
 *
 * @param {Object} options - Options object with
 *    - name: The program name to complete
 *    - completer: The actual program or binary that will act as the completer
 *    for `name` program. Can be the same.
 *    - location: The SHELL script config location (~/.bashrc, ~/.zshrc or
 *    ~/.config/fish/config.fish)
 */
const install = (options = { name: '', completer: '', location: '' }) => {
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
    writeToTabtabScript(options),
    writeToCompletionScript(options)
  ]);
};

/**
 * Not yet implemented. Here the idea is to uninstall a given package
 * completion from internal tabtab and / or the SHELL config.
 *
 * @param {type} name - parameter description...
 */
const uninstall = (options = { name: '' }) => {
  debug('Uninstall with options', options);
  throw new Error('Not yet implemented');
};

module.exports = {
  install,
  uninstall,
  checkFilenameForLine,
  writeToShellConfig,
  writeToTabtabScript,
  writeToCompletionScript,
  writeLineToFilename
};
