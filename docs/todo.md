
a npm package tool to handle:

* configuration
* options parsing
* documentations
* and completion


## why

because I'm constantly repeating the same few steps over and over as
soon as I work on a node utility package, a command line tool, etc.

Aims to provide an easy configuration management, similar to how npm
deals with its own configuration.

Aims to handle options parsing using robust command line parser such as
nopt or optimist, cli options taking precedence over configuration.

Aims to handle documentations and manpage generations, automatically
from markdown. Hook in npm directories and manpage mapping. Fallback
on source parsed content ala docco.

Aims to handle the process of providing completions features for the
package cli.

## configuration

(simpler: jshint, global: cwd + .pkgnamerc, local: cwd + .pkgnamerc).
Local config takes precedence. Resulting configs is the result of the
two.

## options parsing

wrapper around optimist, takes precedence over configuration.

(nice if able to use other tools too: nopt, commander.js)

## documentations

pre-publish manpage generation.

help command (ala npm).

## completion

ala npm. bash/zsh compatible script. tasks or modules implements a
completion method. The bash script 

