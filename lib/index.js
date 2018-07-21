const debug = require('debug')('tabtab');
const inquirer = require('inquirer');
const prompt = require('./prompt');
const installer = require('./installer');

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
  const { name, completer } = options;
  if (!name) throw new TypeError('options.name is required');
  if (!completer) throw new TypeError('options.completer is required');

  return prompt().then(({ location, shell }) =>
    installer.install({
      name,
      completer,
      location
    })
  );
};

module.exports = tabtab;
