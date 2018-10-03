const tabtab = require('../..');

(async () => {
  await tabtab.install({
    name: 'foo',
    completer: 'foo-complete'
  });
})();
