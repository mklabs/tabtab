var optimist = require('optimist');

optimist
  .usage('This is my awesome program', {
    'about': {
      description: 'Provide some details about the author of this program',
      required: true,
      alias: 'desc',
      short: 'a',
    },
    'info': {
      description: 'Provide some information about the node.js agains!!!!!!',
      boolean: true,
      short: 'i'
    }
  })
  .alias('b', 'base')
  .describe('b', 'Numeric base to display the number of lines in')
  .default('b', 10)
  .describe('x', 'Super-secret optional parameter which is secret')
  .default('x', '')


// expose optimist instance so that we can play with it and our completion
module.exports = optimist;


