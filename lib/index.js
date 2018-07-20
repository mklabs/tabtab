const debug = require('debug')('tabtab');
const inquirer = require('inquirer');

const tabtab = () => 'tabtab';

/**
 * Install and enable completion on user system. It'll ask for:
 *
 * - SHELL (bash, zsh or fish)
 * - Path to shell script (with sensible defaults)
 *
 * @param {Object} Options to use with namely `name` and `completer`
 *
 */
tabtab.install = (options = { name: '', completer: '' }) => {
  if (!options.name) throw new Error('options.name is required');
  if (!options.completer) throw new Error('options.name is required');
};

module.exports = tabtab;
