const tabtab = require('../..');

(async () => {
  const result = await tabtab.install({
    name: 'foo',
    completer: 'foo-complete'
  });

  console.log('Result', result);
})();
