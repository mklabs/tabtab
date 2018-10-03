const inquirer = require('inquirer');
const path = require('path');
const debug = require('./utils/tabtabDebug')('tabtab:prompt');

/**
 * Asks user about SHELL and desired location.
 *
 * It is too difficult to check spawned SHELL, the user has to use chsh before
 * it is reflected in process.env.SHELL
 */
const prompt = () => {
  const ask = inquirer.createPromptModule();

  const questions = [
    {
      type: 'list',
      name: 'shell',
      message: 'Which Shell do you use ?',
      choices: ['bash', 'zsh', 'fish'],
      default: 'bash'
    }
  ];

  const locations = {
    bash: '~/.bashrc',
    zsh: '~/.zshrc',
    fish: '~/.config/fish/config.fish'
  };

  const finalAnswers = {};

  return ask(questions)
    .then(answers => {
      const { shell } = answers;
      debug('answers', shell);

      const location = locations[shell];
      debug(`Will install completion to ${location}`);

      Object.assign(finalAnswers, { location, shell });
      return location;
    })
    .then(location =>
      ask({
        type: 'confirm',
        name: 'locationOK',
        message: `We will install completion to ${location}, is it ok ?`
      })
    )
    .then(answers => {
      const { locationOK } = answers;
      if (locationOK) {
        debug('location is ok, return', finalAnswers);
        return finalAnswers;
      }

      // otherwise, ask for specific **absolute** path
      return ask({
        name: 'userLocation',
        message: 'Which path then ? Must be absolute.',
        validate: input => {
          debug('Validating input', input);
          return path.isAbsolute(input);
        }
      }).then(lastAnswer => {
        const { userLocation } = lastAnswer;
        console.log(`Very well, we will install using ${userLocation}`);
        Object.assign(finalAnswers, { location: userLocation });

        return finalAnswers;
      });
    });
};

module.exports = prompt;
