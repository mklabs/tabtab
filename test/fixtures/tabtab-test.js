// This file is just there to test out completion
const tabtab = require('../..');

(async () => {
  const result = await tabtab.install({
    name: 'tabtab',
    completer: 'tabtab'
  });
})();
