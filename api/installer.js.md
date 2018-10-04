## Functions

<dl>
<dt><a href="#shellExtension">shellExtension(location)</a> ⇒</dt>
<dd><p>Little helper to return the correct file extension based on the SHELL script
location.</p>
</dd>
<dt><a href="#scriptFromLocation">scriptFromLocation(location)</a> ⇒</dt>
<dd><p>Helper to return the correct script template based on the SHELL script
location</p>
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
completion mechanism, in the internal .completions/ directory. Every
completion is added to this file.</p>
</dd>
<dt><a href="#writeToCompletionScript">writeToCompletionScript(options)</a></dt>
<dd><p>This writes a new completion script in the internal <code>.completions/</code>
directory. Depending on the SHELL used (and the location parameter), a
different script is created for the given SHELL.</p>
</dd>
<dt><a href="#install">install(options)</a></dt>
<dd><p>Top level install method. Does three things:</p>
<ul>
<li>Writes to SHELL config file, adding a new line to tabtab internal script.</li>
<li>Creates or edit tabtab internal script</li>
<li>Creates the actual completion script for this package.</li>
</ul>
</dd>
<dt><a href="#uninstall">uninstall(name)</a></dt>
<dd><p>Not yet implemented. Here the idea is to uninstall a given package
completion from internal tabtab and / or the SHELL config.</p>
</dd>
</dl>

<a name="shellExtension"></a>

## shellExtension(location) ⇒
Little helper to return the correct file extension based on the SHELL script
location.

**Kind**: global function  
**Returns**: The correct file extension for the given SHELL script location  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>String</code> | Shell script location |

<a name="scriptFromLocation"></a>

## scriptFromLocation(location) ⇒
Helper to return the correct script template based on the SHELL script
location

**Kind**: global function  
**Returns**: The template script content  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>String</code> | Shell script location |

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
| options | <code>Object</code> | Options with    - filename: The file to modify    - scriptname: The line to add sourcing this file    - location: The SHELL script location    - name: The package being configured    - inShellConfig: Whether it is done in the SHELL script location, used to    add a few more descriptive lines to the file |

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
completion mechanism, in the internal .completions/ directory. Every
completion is added to this file.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - location: The SHELL script location (~/.bashrc, ~/.zshrc or    ~/.config/fish/config.fish)    - name: The package configured for completion |

<a name="writeToCompletionScript"></a>

## writeToCompletionScript(options)
This writes a new completion script in the internal `.completions/`
directory. Depending on the SHELL used (and the location parameter), a
different script is created for the given SHELL.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options object with    - name: The package configured for completion    - completer: The binary that will act as the completer for `name` program    - location: The SHELL script location (~/.bashrc, ~/.zshrc or    ~/.config/fish/config.fish) |

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

<a name="uninstall"></a>

## uninstall(name)
Not yet implemented. Here the idea is to uninstall a given package
completion from internal tabtab and / or the SHELL config.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>type</code> | parameter description... |

