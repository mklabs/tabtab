# tabtab

[![Build Status](https://travis-ci.org/mklabs/tabtab.svg?branch=3.0.0-alpha)](https://travis-ci.org/mklabs/tabtab)
[![Coverage Status](https://coveralls.io/repos/github/mklabs/tabtab/badge.svg?branch=3.0.0-alpha)](https://coveralls.io/github/mklabs/tabtab?branch=3.0.0-alpha)

A node package to do some custom command line `<tab><tab>` completion for any
system command, for Bash, Zsh, and Fish shells.

Made possible using the same technique as npm (whose completion is quite
awesome) relying on a shell script bridge to do the actual completion from
node's land.

**Warning / Breaking changes**

- Windows is not supported
- Cache has been removed
- tabtab now emits the whole line (ex. program foobar) instead of emitting
  several events at once (program and foobar).

### Goal of this 3.0.0 version

Simplify everything, major overhaul, rewrite from scratch.

Functional, less abstraction, clearer documentation, good test coverage,
support for node 6/8/10 without babel.

Up to date dependencies, easier to debug, easier to test.

If possible, windows support (with git bash)

Should still support bash, zsh and fish but bash is the primary focus of this alpha version.

No binary file anymore, just a library.

The goal of this rewrite is two-folded:

- Integrate nicely with [yo](https://github.com/yeoman/yo) (Yeoman)
- Have a robust and fast enough library for [yarn-completions](https://github.com/mklabs/yarn-completions)

---

> [mit](./license) &nbsp;&middot;&nbsp;
> [mklabs.github.io](https://mklabs.github.io) &nbsp;&middot;&nbsp;
> [@mklabs](https://github.com/mklabs)
