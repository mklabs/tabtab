const { install, uninstall } = require('../../lib/installer');

(async () => {
  await install({
    name: 'foo',
    completer: 'foo-complete',
    location: '~/.bashrc'
  });
})();
