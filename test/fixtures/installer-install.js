const { install } = require('../../lib/installer');

(async () => {
  await install({
    name: 'foo',
    completer: 'foo-complete',
    location: '~/.bashrc'
  });
})();
