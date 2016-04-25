const assert = require('assert');
const cli    = require('gentle-cli');

function tabtab(cmd) {
  return cli().use(cmd ? 'tabtab ' + cmd : 'tabtab');
}

describe('CLI', () => {

  it('outputs help', (done) => {
    tabtab()
      .expect(0, 'tabtab <command>')
      .expect(0, 'Commands:')
      .end((err, res) => {
        done(err);
      });
  });

  it('install stdout', (done) => {
    tabtab('install --stdout')
      .expect('complete -o default -F _tabtab_completion tabtab')
      .expect('compdef _tabtab_completion tabtab')
      .expect('compctl -K _tabtab_completion tabtab')
      .end(done);
  });

  it('install prompt', (done) => {
    tabtab('install')
      // Prompt first answer, output to stdout
      .prompt(/Where do you want/, '\n')
      .expect('complete -o default -F _tabtab_completion tabtab')
      .expect('compdef _tabtab_completion tabtab')
      .expect('compctl -K _tabtab_completion tabtab')
      .end(done);
  });


});
