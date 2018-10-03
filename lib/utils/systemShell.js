/**
 * Utility to figure out the shell used on the system.
 *
 * Sadly, we can't use `echo $0` in node, maybe with more work. So we rely on
 * process.env.SHELL.
 *
 * TODO: More work on this, namely to detect Git bash on Windows (bash.exe)
 */
const systemShell = () => (process.env.SHELL || '').split('/').slice(-1)[0];

module.exports = systemShell;
