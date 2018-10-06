## Functions

<dl>
<dt><a href="#shellExtension">shellExtension()</a> ⇒</dt>
<dd><p>Little helper to return the correct file extension based on the SHELL value.</p>
</dd>
<dt><a href="#scriptFromShell">scriptFromShell(shell)</a> ⇒</dt>
<dd><p>Helper to return the correct script template based on the SHELL provided</p>
</dd>
<dt><a href="#locationFromShell">locationFromShell(shell)</a> ⇒ <code>String</code></dt>
<dd><p>Helper to return the expected location for SHELL config file, based on the
provided shell value.</p>
</dd>
<dt><a href="#sourceLineForShell">sourceLineForShell(scriptname, shell)</a></dt>
<dd><p>Helper to return the source line to add depending on the SHELL provided or detected.</p>
<p>If the provided SHELL is not known, it returns the source line for a Bash shell.</p>
</dd>
<dt><a href="#isInShellConfig">isInShellConfig(filename)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Helper to check if a filename is one of the SHELL config we expect</p>
</dd>
<dt><a href="#checkFilenameForLine">checkFilenameForLine(filename, line)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Checks a given file for the existence of a specific line. Used to prevent
adding multiple completion source to SHELL scripts.</p>
</dd>
<dt><a href="#writeLineToFilename">writeLineToFilename(options)</a></dt>
<dd><p>Opens a file for modification adding a new <code>source</code> line for the given
SHELL. Used for both SHELL script and tabtab internal one.</p>
</dd>
<dt><a href="#writeToShellConfig">writeToShellConfig(options)</a></dt>
<dd><p>Writes to SHELL config file adding a new line, but only one, to the SHELL
config script. This enables tabtab to work for the given SHELL.</p>
</dd>
<dt><a href="#writeToTabtabScript">writeToTabtabScript(options)</a></dt>
<dd><p>Writes to tabtab internal script that acts as a frontend router for the
completion mechanism, in the internal ~/.config/tabtab directory. Every
completion is added to this file.</p>
</dd>
<dt><a href="#writeToCompletionScript">writeToCompletionScript(options)</a></dt>
<dd><p>This writes a new completion script in the internal <code>~/.config/tabtab</code>
directory. Depending on the SHELL used, a different script is created for
the given SHELL.</p>
</dd>
<dt><a href="#install">install(options)</a></dt>
<dd><p>Top level install method. Does three things:</p>
<ul>
<li>Writes to SHELL config file, adding a new line to tabtab internal script.</li>
<li>Creates or edit tabtab internal script</li>
<li>Creates the actual completion script for this package.</li>
</ul>
</dd>
<dt><a href="#removeLinesFromFilename">removeLinesFromFilename(filename, name)</a></dt>
<dd><p>Removes the 3 relevant lines from provided filename, based on the package
name passed in.</p>
</dd>
<dt><a href="#uninstall">uninstall(options)</a></dt>
<dd><p>Here the idea is to uninstall a given package completion from internal
tabtab scripts and / or the SHELL config.</p>
<p>It also removes the relevant scripts if no more completion are installed on
the system.</p>
</dd>
</dl>

<a name="shellExtension"></a>

## shellExtension() ⇒
Little helper to return the correct file extension based on the SHELL value.

**Kind**: global function  
**Returns**: The correct file extension for the given SHELL script location  
<a name="scriptFromShell"></a>

## scriptFromShell(shell) ⇒
Helper to return the correct script template based on the SHELL provided

**Kind**: global function  
**Returns**: The template script content, defaults to Bash for shell we don't know yet  

| Param | Type | Description |
| --- | --- | --- |
| shell | <code>String</code> | Shell to base the check on, defaults to system shell. |

<a name="locationFromShell"></a>

## locationFromShell(shell) ⇒ <code>String</code>
Helper to return the expected location for SHELL config file, based on the
provided shell value.

**Kind**: global function  
**Returns**: <code>String</code> - Either ~/.bashrc, ~/.zshrc or ~/.config/fish/config.fish,
untildified. Defaults to ~/.bashrc if provided SHELL is not valid.  

| Param | Type | Description |
| --- | --- | --- |
| shell | <code>String</code> | Shell value to test against |

<a name="sourceLineForShell"></a>

## sourceLineForShell(scriptname, shell)
Helper to return the source line to add depending on the SHELL provided or detected.

If the provided SHELL is not known, it returns the source line for a Bash shell.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| scriptname | <code>String</code> | The script to source |
| shell | <code>String</code> | Shell to base the check on, defaults to system shell. |

<a name="isInShellConfig"></a>

## isInShellConfig(filename) ⇒ <code>Boolean</code>
Helper to check if a filename is one of the SHELL config we expect

**Kind**: global function  
**Returns**: <code>Boolean</code> - Either true or false  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | Filename to check against |

<a name="checkFilenameForLine"></a>

## checkFilenameForLine(filename, line) ⇒ <code>Boolean</code>
Checks a given file for the existence of a specific line. Used to prevent
adding multiple completion source to SHELL scripts.

**Kind**: global function  
**Returns**: <code>Boolean</code> - true or false, false if the line is not present.  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | The filename to check against |
| line | <code>String</code> | The line to look for |

<a name="writeLineToFilename"></a>

## writeLineToFilename(options)
Opens a file for modification adding a new `source` line for the given
SHELL. Used for both SHELL script and tabtab internal one.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options with    - filename: The file to modify    - scriptname: The line to add sourcing this file    - name: The package being configured |

<a name="writeToShellConfig"></a>

## writeToShellConfig(options)
Writes to SHELL config file adding a new line, but only one, to the SHELL
config script. This enables tabtab to work for the given SHELL.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - location: The SHELL script location (~/.bashrc, ~/.zshrc or    ~/.config/fish/config.fish)    - name: The package configured for completion |

<a name="writeToTabtabScript"></a>

## writeToTabtabScript(options)
Writes to tabtab internal script that acts as a frontend router for the
completion mechanism, in the internal ~/.config/tabtab directory. Every
completion is added to this file.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - name: The package configured for completion |

<a name="writeToCompletionScript"></a>

## writeToCompletionScript(options)
This writes a new completion script in the internal `~/.config/tabtab`
directory. Depending on the SHELL used, a different script is created for
the given SHELL.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - name: The package configured for completion    - completer: The binary that will act as the completer for `name` program |

<a name="install"></a>

## install(options)
Top level install method. Does three things:

- Writes to SHELL config file, adding a new line to tabtab internal script.
- Creates or edit tabtab internal script
- Creates the actual completion script for this package.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - name: The program name to complete    - completer: The actual program or binary that will act as the completer    for `name` program. Can be the same.    - location: The SHELL script config location (~/.bashrc, ~/.zshrc or    ~/.config/fish/config.fish) |

<a name="removeLinesFromFilename"></a>

## removeLinesFromFilename(filename, name)
Removes the 3 relevant lines from provided filename, based on the package
name passed in.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | The filename to operate on |
| name | <code>String</code> | The package name to look for |

<a name="uninstall"></a>

## uninstall(options)
Here the idea is to uninstall a given package completion from internal
tabtab scripts and / or the SHELL config.

It also removes the relevant scripts if no more completion are installed on
the system.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - name: The package name to look for |

