const Complete = require('./complete');

tabtab.Commands = require('./commands');
tabtab.Complete = Complete;

// Public: Tabtab entry point.
//
// It provides the main API to the completion and plumbing system, in the form
// of an EventEmitter with the following events.
//
// options - The options hash as parsed by minimist (default: {})
//
// Examples
//
//    // The binary name being completed.
//    complete.on('name', function(data, done) {});
//
//    // The very last word being completed, preceding the cursor tab position
//    complete.on('list', function(data, done) {});
//
// Returns an instance of Complete.
module.exports = tabtab(options) => {
  return new Complete(options);
};
