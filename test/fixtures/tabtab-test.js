// This file is just there to test out completion
const tabtab = require('../..');

(async () => {
  await tabtab.install({
    name: 'tabtab',
    completer: 'tabtab'
  });
})();
