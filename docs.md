## Classes

<dl>
<dt><a href="#CommandHander">CommandHander</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#HandlerSettings">HandlerSettings</a> : <code>Object</code></dt>
<dd><p>Options for the Coammnd Handler.</p>
</dd>
</dl>

<a name="CommandHander"></a>

## CommandHander
**Kind**: global class  

* [CommandHander](#CommandHander)
    * [new CommandHander(client, settings)](#new_CommandHander_new)
    * [.handle(client, message)](#CommandHander+handle)

<a name="new_CommandHander_new"></a>

### new CommandHander(client, settings)
Module to run and handle Commands.


| Param | Type | Description |
| --- | --- | --- |
| client | <code>Client</code> | Discord.js Client. |
| settings | [<code>HandlerSettings</code>](#HandlerSettings) | Settings Object. |

**Example**  
```js
new commandhandler(client, { prefix: '?', owner: ['193406800614129664'], folder: 'cmds' });
```
<a name="CommandHander+handle"></a>

### commandHander.handle(client, message)
Module to run and handle Commands.

**Kind**: instance method of [<code>CommandHander</code>](#CommandHander)  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>Client</code> | Discord Client. |
| message | <code>Message</code> | Message Object to handle Command in. |

**Example**  
```js
commandhandler.run(client, message);
```
<a name="HandlerSettings"></a>

## HandlerSettings : <code>Object</code>
Options for the Coammnd Handler.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [prefix] | <code>string</code> | <code>&quot;&#x27;!&#x27;&quot;</code> | Prefix. |
| [owner] | <code>Array</code> | <code>[]</code> | Array of ids with Bot Perms. |
| [folder] | <code>string</code> | <code>&quot;&#x27;commands&#x27;&quot;</code> | Folder where the Commands are in. |
| [cooldowns] | <code>\*</code> | <code>true</code> | If Cooldowns are Enabled, either true/false, or Collection |
| [defaultcmds] | <code>boolean</code> | <code>true</code> | Load Default Commands. |

