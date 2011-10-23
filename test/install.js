

var vows = require('vows'),
fs = require('fs'),
path = require('path'),
assert = require('assert'),
completion = require('../lib/completion'),
argv = process.argv.slice(0, 2);

var completionSh = fs.readFileSync(path.join(__dirname, '..', 'lib', 'completion', 'completion.sh'), 'utf8')
  .replace(/\{pkgname\}/g, 'foo')
  .replace(/{completer}/g, 'foo');

vows.describe('basic test suite for completion script output')
  .addBatch({
    'executing script with just completion command and no COMP_*': {
      topic: function() {
        // prepare env variables and argv before requiring the completion module
        process.argv = argv.concat('completion');
        // reset COMP_* to a falsy value, other tests may have set them to something already
        delete process.env.COMP_CWORD;
        delete process.env.COMP_POINT;
        delete process.env.COMP_LINE;
        completion.complete('foo', this.callback);
      },

      'should dump the script': function(err, results) {
        assert.ok(!err, err ? err.message : '');
        assert.equal(results, completionSh, 'Script output different');
      }
    },

    'executing completion install': {
      topic: function() {
        // prepare env variables and argv before requiring the completion module
        process.argv = argv.concat('completion', 'install');
        // reset COMP_* to a falsy value, other tests may have set them to something already
        delete process.env.COMP_CWORD;
        delete process.env.COMP_POINT;
        delete process.env.COMP_LINE;
        completion.complete('foo', 'node ' + path.join(__dirname, 'fixtures', 'completer.js'), this.callback);
      },

      'should edit ~/.bashrc or ~/.zshrc depending on the process.env.SHELL and append script output': function(err, results) {
        assert.ok(!err, err ? err.message : '');
        assert.equal(results, ' ✓ node /Users/mk/Temp/dev/mklabs/pkgrc/test/fixtures/completer.js installed.', 'Script output different');
      },

      'then executing completion uninstall': {
        topic: function() {
          // prepare env variables and argv before requiring the completion module
          process.argv = argv.concat('completion', 'uninstall');
          // reset COMP_* to a falsy value, other tests may have set them to something already
          delete process.env.COMP_CWORD;
          delete process.env.COMP_POINT;
          delete process.env.COMP_LINE;
          completion.complete('foo', 'node ' + path.join(__dirname, 'fixtures', 'completer.js'), this.callback);
        },
        'should revert the install': function(err, results) {
          assert.ok(!err, err ? err.message : '');
          assert.equal(results, ' ✓ node /Users/mk/Temp/dev/mklabs/pkgrc/test/fixtures/completer.js uninstalled.', 'Script output different');
        }
      }
    }
  }).export(module);
