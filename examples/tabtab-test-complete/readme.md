# tabtab-test-complete

A simple package to test out tabtab against real completions.

To install, simply run `npm link`

    npm link

It'll install the following binary system-wide:

- tabtab-test: The actual binary being completed

## Shell notes

To test against **bash**, make sure to have `$SHELL` set to either `bash` or `/bin/bash` or similar.

To test against **zsh**, make sure to have zsh installed, and then, if you use bash
as your standard SHELL, type `zsh`. It'll spawn a new zsh session. Within this,
run `SHELL=zsh` to set the environment accordingly so that tabtab understands
the current shell used is actually zsh.

Similarly, to test against **fish**, make sure to have fish installed, and then
the same steps to reproduce. This time, make sure to type `fish` and run `set
SHELL fish`. This is required for tabtab to understand the shell being used is
actually fish.

Those steps are not required if testing against your system shell (possibly using `chsh`).

## Completion install

In this example package, simply run:

    tabtab-test install-completion

You'll need to do this for each and every shell you're testing against. Follow
the `Shell notes` described above for details.
