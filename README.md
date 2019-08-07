# If you are using discord.js v12 / master:
`npm i PLASMAchicken/easy-djs-commandhandler`

# Module to make an fast setup Discord Bot, simply do:

```js
const Discord = require('discord.js');
const commandHandler = require('easy-djs-commandhandler');

const client = new Discord.Client();
const handle = new commandHandler.Handler(client, {owner: ['193406800614129664']});

client.on('message', message => {
    handle.handle(client, message);
})
client.on('messageUpdate', (oldmessage, message) => {
    handle.handle(client, message);
})

client.login()
```

# Then you can make your own Commands in the `commands` ( customizeable ) folder, by doing:
```js
const { Client, Message } = require('discord.js');
/**
 * @param {Client} client - Discord.js Client.
 * @param {Message} message - Discord.js Message.
 * @param {Array} args - Array with parsed args.
 */
module.exports.run = async (client, message, args) => {
	message.channel.send('Hello World!');
};

module.exports.help = {
	name: 'cmdname',
	description: '',
    hideinhelp: false,
    requires: ['botowner', 'guild', 'dm'],
	usage: '<prefix>cmdname',   // <prefix> gets replaced with the prefix
	aliases: ['cmdalias'],
	requiresBotPermissions: ['EMBED_LINKS'], // Array containing Permissions that need to be checked, SEND_MESSAGES, is included automatically
	// cooldownGroup: 'example' || use this to cooldown all the commands in that group
};  // to get a category just make a sub-folder
```
or by using the Command Class:
```js
const { Command } = require('easy-djs-commandhandler');
module.exports = new Command({ 
	name: 'cmdname',
	description: '',
    hideinhelp: false,
    requires: ['botowner', 'guild', 'dm'],
	usage: '<prefix>cmdname',   // <prefix> gets replaced with the prefix
	aliases: ['cmdalias'],
	requiresBotPermissions: ['EMBED_LINKS'], // Array containing Permissions that need to be checked, SEND_MESSAGES, is included automatically
	// cooldownGroup: 'example' || use this to cooldown all the commands in that group
	// to get a category just make a sub-folder
	}).execute((client, message, args) => {
	message.channel.send('Hello Discord!');
});
```

# Using ArgumentsCollector
```js
const { Command, ArgumentCollector } = require('easy-djs-commandhandler');
module.exports = new Command({ name: 'collect' }).execute(async (client, message, args) => {
	const collector = new ArgumentCollector([{ prompt: 'What did you eat today?', key: 'food_today' }, { prompt: 'What channel is this?', key: 'test_channel', attempts:3, errorMsg: 'Something went wrong!', type: 'channel', time: 5999 }]);
	const collected = await collector.obtain(message);
	console.log(collected);// retruns { values: { food_today: message_object, test_channel: channel_object }, canceled: false };
	console.log(collected.values.food_today.content);	// if no type specified, returns collected message object, example: get content of collected message
	console.log(collected.values.test_channel.name);	// type: 'channel', returns channel object, example: get name of the channel
});
```

# Using Custom Prefixes

```js
const handle = new commandHandler.Handler(client, {
	owner: ['193406800614129664'],
	prefixFunc : (message, client) => {
		// have something wich gets the specific prefix for that guild/user and return it;
		// eg. return guildsettings.get(message.guild.id).prefix;
		if(message.guild && message.guild.id == '193406800614129664') return 'B';	// The Prefix for this Guild will be B
		else return 'C';															// The Prefix for all other Guilds will be C
	},
});
```


# Using Custom/Presistant Cooldowns

```js

const Enmap = require("enmap");

// Normal enmap with default options
const cooldownsEnmap = new Enmap({name: "cooldowns"});

const handle = new commandHandler.Handler(client, {owner: ['193406800614129664'], cooldowns: cooldownsEnmap});

```

