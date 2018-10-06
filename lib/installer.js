const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const { promisify } = require('es6-promisify');
const mkdirp = promisify(require('mkdirp'));
const { tabtabDebug, systemShell, exists } = require('./utils');

const debug = tabtabDebug('tabtab:installer');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const {
  BASH_LOCATION,
  FISH_LOCATION,
  ZSH_LOCATION,
  COMPLETION_DIR,
  TABTAB_SCRIPT_NAME
} = require('./constants');

/**
 * Little helper to return the correct file extension based on the SHELL value.
 *
 * @returns The correct file extension for the given SHELL script location
 */
const shellExtension = () => systemShell();

/**
 * Helper to return the correct script template based on the SHELL provided
 *
 * @param {String} shell - Shell to base the check on, defaults to system shell.
 * @returns The template script content, defaults to Bash for shell we don't know yet
 */
const scriptFromShell = (shell = systemShell()) => {
  if (shell === 'fish') {
    return path.join(__dirname, 'scripts/fish.sh');
  }

  if (shell === 'zsh') {
    return path.join(__dirname, 'scripts/zsh.sh');
  }

  // For Bash and others
  return path.join(__dirname, 'scripts/bash.sh');
};

/**
 * Helper to return the expected location for SHELL config file, based on the
 * provided shell value.
 *
 * @param {String} shell - Shell value to test against
 * @returns {String} Either ~/.bashrc, ~/.zshrc or ~/.config/fish/config.fish,
 * untildified. Defaults to ~/.bashrc if provided SHELL is not valid.
 */
const locationFromShell = (shell = systemShell()) => {
  if (shell === 'bash') return untildify(BASH_LOCATION);
  if (shell === 'zsh') return untildify(ZSH_LOCATION);
  if (shell === 'fish') return untildify(FISH_LOCATION);
  return BASH_LOCATION;
};

/**
 * Helper to return the source line to add depending on the SHELL provided or detected.
 *
 * If the provided SHELL is not known, it returns the source line for a Bash shell.
 *
 * @param {String} scriptname - The script to source
 * @param {String} shell - Shell to base the check on, defaults to system
 * shell.
 */
const sourceLineForShell = (scriptname, shell = systemShell()) => {
  if (shell === 'fish') {
    return `[ -f ${scriptname} ]; and . ${scriptname}; or true`;
  }

  if (shell === 'zsh') {
    return `[[ -f ${scriptname} ]] && . ${scriptname} || true`;
  }

  // For Bash and others
  return `[ -f ${scriptname} ] && . ${scriptname} || true`;
};

/**
 * Helper to check if a filename is one of the SHELL config we expect
 *
 * @param {String} filename - Filename to check against
 * @returns {Boolean} Either true or false
 */
const isInShellConfig = filename =>
  [
    BASH_LOCATION,
    ZSH_LOCATION,
    FISH_LOCATION,
    untildify(BASH_LOCATION),
    untildify(ZSH_LOCATION),
    untildify(FISH_LOCATION)
  ].includes(filename);

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
 *    - name: The package being configured
 */
const writeLineToFilename = ({ filename, scriptname, name }) => (
  resolve,
  reject
) => {
  const filepath = untildify(filename);

  debug('Creating directory for %s file', filepath);
  mkdirp(path.dirname(filepath))
    .then(() => {
      const stream = fs.createWriteStream(filepath, { flags: 'a' });
      stream.on('error', reject);
      stream.on('finish', () => resolve());

      debug('Writing to shell configuration file (%s)', filename);
      debug('scriptname:', scriptname);

      const inShellConfig = isInShellConfig(filename);
      if (inShellConfig) {
        stream.write(`\n# tabtab source for packages`);
      } else {
        stream.write(`\n# tabtab source for ${name} package`);
      }

      stream.write('\n# uninstall by removing these lines');
      stream.write(`\n${sourceLineForShell(scriptname)}`);
      stream.end('\n');

      console.log('=> Added tabtab source line in "%s" file', filename);
    })
    .catch(err => {
      console.error('mkdirp ERROR', err);
      reject(err);
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
    COMPLETION_DIR,
    `${TABTAB_SCRIPT_NAME}.${shellExtension()}`
  );

  const filename = location;

  // Check if SHELL script already has a line for tabtab
  const existing = await checkFilenameForLine(filename, scriptname);
  if (existing) {
    return console.log('=> Tabtab line already exists in %s file', filename);
  }

  return new Promise(
    writeLineToFilename({
      filename,
      scriptname,
      name
    })
  );
};

/**
 * Writes to tabtab internal script that acts as a frontend router for the
 * completion mechanism, in the internal ~/.config/tabtab directory. Every
 * completion is added to this file.
 *
 * @param {Object} options - Options object with
 *    - name: The package configured for completion
 */
const writeToTabtabScript = async ({ name }) => {
  const filename = path.join(
    COMPLETION_DIR,
    `${TABTAB_SCRIPT_NAME}.${shellExtension()}`
  );

  const scriptname = path.join(COMPLETION_DIR, `${name}.${shellExtension()}`);

  // Check if tabtab completion file already has this line in it
  const existing = await checkFilenameForLine(filename, scriptname);
  if (existing) {
    return console.log('=> Tabtab line already exists in %s file', filename);
  }

  return new Promise(writeLineToFilename({ filename, scriptname, name }));
};

/**
 * This writes a new completion script in the internal `~/.config/tabtab`
 * directory. Depending on the SHELL used, a different script is created for
 * the given SHELL.
 *
 * @param {Object} options - Options object with
 *    - name: The package configured for completion
 *    - completer: The binary that will act as the completer for `name` program
 */
const writeToCompletionScript = ({ name, completer }) => {
  const filename = untildify(
    path.join(COMPLETION_DIR, `${name}.${shellExtension()}`)
  );

  const script = scriptFromShell();
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
    .then(filecontent =>
      mkdirp(path.dirname(filename)).then(() =>
        writeFile(filename, filecontent)
      )
    )
    .then(() => console.log('=> Wrote completion script to %s file', filename))
    .catch(err => console.error('ERROR:', err));
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
const install = async (options = { name: '', completer: '', location: '' }) => {
  debug('Install with options', options);
  if (!options.name) {
    throw new Error('options.name is required');
  }

  if (!options.completer) {
    throw new Error('options.completer is required');
  }

  if (!options.location) {
    throw new Error('options.location is required');
  }

  await Promise.all([
    writeToShellConfig(options),
    writeToTabtabScript(options),
    writeToCompletionScript(options)
  ]).then(() => {
    const { location, name } = options;
    console.log(`
      => Tabtab source line added to ${location} for ${name} package.

      Make sure to reload your SHELL.
    `);
  });
};

/**
 * Removes the 3 relevant lines from provided filename, based on the package
 * name passed in.
 *
 * @param {String} filename - The filename to operate on
 * @param {String} name - The package name to look for
 */
const removeLinesFromFilename = async (filename, name) => {
  /* eslint-disable no-unused-vars */
  debug('Removing lines from %s file, looking for %s package', filename, name);
  if (!(await exists(filename))) {
    return debug('File %s does not exist', filename);
  }

  const filecontent = await readFile(filename, 'utf8');
  const lines = filecontent.split(/\r?\n/);

  const sourceLine = isInShellConfig(filename)
    ? `# tabtab source for packages`
    : `# tabtab source for ${name} package`;

  const hasLine = !!filecontent.match(`${sourceLine}`);
  if (!hasLine) {
    return debug('File %s does not include the line: %s', filename, sourceLine);
  }

  let lineIndex = -1;
  const buffer = lines
    // Build up the new buffer, removing the 3 lines following the sourceline
    .map((line, index) => {
      const match = line.match(sourceLine);
      if (match) {
        lineIndex = index;
      } else if (lineIndex + 3 <= index) {
        lineIndex = -1;
      }

      return lineIndex === -1 ? line : '';
    })
    // Remove any double empty lines from this file
    .map((line, index, array) => {
      const next = array[index + 1];
      if (line === '' && next === '') {
        return;
      }

      return line;
    })
    // Remove any undefined value from there
    .filter(line => line !== undefined)
    .join('\n')
    .trim();

  await writeFile(filename, buffer);
  console.log('=> Removed tabtab source lines from %s file', filename);
};

/**
 * Here the idea is to uninstall a given package completion from internal
 * tabtab scripts and / or the SHELL config.
 *
 * It also removes the relevant scripts if no more completion are installed on
 * the system.
 *
 * @param {Object} options - Options object with
 *    - name: The package name to look for
 */
const uninstall = async (options = { name: '' }) => {
  debug('Uninstall with options', options);
  const { name } = options;

  if (!name) {
    throw new Error('Unable to uninstall if options.name is missing');
  }

  const completionScript = untildify(
    path.join(COMPLETION_DIR, `${name}.${shellExtension()}`)
  );

  // First, lets remove the completion script itself
  if (await exists(completionScript)) {
    await unlink(completionScript);
    console.log('=> Removed completion script (%s)', completionScript);
  }

  // Then the lines in ~/.config/tabtab/__tabtab.shell
  const tabtabScript = untildify(
    path.join(COMPLETION_DIR, `${TABTAB_SCRIPT_NAME}.${shellExtension()}`)
  );
  await removeLinesFromFilename(tabtabScript, name);

  // Then, check if __tabtab.shell is empty, if so remove the last source line in SHELL config
  const isEmpty = (await readFile(tabtabScript, 'utf8')).trim() === '';
  if (isEmpty) {
    const shellScript = locationFromShell();
    debug(
      'File %s is empty. Removing source line from %s file',
      tabtabScript,
      shellScript
    );
    await removeLinesFromFilename(shellScript, name);
  }

  console.log('=> Uninstalled completion for %s package', name);
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
