## Functions

<dl>
<dt><a href="#install">install(Options)</a></dt>
<dd><p>Install and enable completion on user system. It&#39;ll ask for:</p>
<ul>
<li>SHELL (bash, zsh or fish)</li>
<li>Path to shell script (with sensible defaults)</li>
</ul>
</dd>
<dt><a href="#parseEnv">parseEnv()</a></dt>
<dd><p>Public: Main utility to extract information from command line arguments and
Environment variables, namely COMP args in &quot;plumbing&quot; mode.</p>
<p>options -  The options hash as parsed by minimist, plus an env property
           representing user environment (default: { env: process.env })
   :_      - The arguments Array parsed by minimist (positional arguments)
   :env    - The environment Object that holds COMP args (default: process.env)</p>
<p>Examples</p>
<p>  const env = tabtab.parseEnv();
  // env:
  // complete    A Boolean indicating whether we act in &quot;plumbing mode&quot; or not
  // words       The Number of words in the completed line
  // point       A Number indicating cursor position
  // line        The String input line
  // partial     The String part of line preceding cursor position
  // last        The last String word of the line
  // lastPartial The last word String of partial
  // prev        The String word preceding last</p>
<p>Returns the data env object.</p>
</dd>
<dt><a href="#completionItem">completionItem(item)</a></dt>
<dd><p>Helper to normalize String and Objects with { name, description } when logging out.</p>
</dd>
<dt><a href="#log">log(Arguments)</a></dt>
<dd><p>Main logging utility to pass completion items.</p>
<p>This is simply an helper to log to stdout with each item separated by a new
line.</p>
<p>Bash needs in addition to filter out the args for the completion to work
(zsh, fish don&#39;t need this).</p>
</dd>
</dl>

<a name="install"></a>

## install(Options)
Install and enable completion on user system. It'll ask for:

- SHELL (bash, zsh or fish)
- Path to shell script (with sensible defaults)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Options | <code>Object</code> | to use with namely `name` and `completer` |

<a name="parseEnv"></a>

## parseEnv()
Public: Main utility to extract information from command line arguments and
Environment variables, namely COMP args in "plumbing" mode.

options -  The options hash as parsed by minimist, plus an env property
           representing user environment (default: { env: process.env })
   :_      - The arguments Array parsed by minimist (positional arguments)
   :env    - The environment Object that holds COMP args (default: process.env)

Examples

  const env = tabtab.parseEnv();
  // env:
  // complete    A Boolean indicating whether we act in "plumbing mode" or not
  // words       The Number of words in the completed line
  // point       A Number indicating cursor position
  // line        The String input line
  // partial     The String part of line preceding cursor position
  // last        The last String word of the line
  // lastPartial The last word String of partial
  // prev        The String word preceding last

Returns the data env object.

**Kind**: global function  
<a name="completionItem"></a>

## completionItem(item)
Helper to normalize String and Objects with { name, description } when logging out.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>String</code> \| <code>Object</code> | Item to normalize |

<a name="log"></a>

## log(Arguments)
Main logging utility to pass completion items.

This is simply an helper to log to stdout with each item separated by a new
line.

Bash needs in addition to filter out the args for the completion to work
(zsh, fish don't need this).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Arguments | <code>Array</code> | to log, Strings or Objects with name and description property. |

