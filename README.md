Module to make an fast setup Discord Bot, simply do:

```js
const Discord = require('discord.js');
const commandHandler = require('easy-djs-commandhandler');

const client = new Discord.Client();
const handle = new commandHandler(client, {owner: ['193406800614129664']});

client.on('message', message => {
    handle.handle(client, message);
})
client.on('messageUpdate', (oldmessage, message) => {
    handle.handle(client, message);
})

client.login()
```

Then you can make your own Commands in the `commands` ( customizeable ) folder, by doing:
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
};  // to get a category just make a sub-folder
```

More Info can be found in docs.md