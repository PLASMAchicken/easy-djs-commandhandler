const { Client, Message } = require('discord.js');
/**
 * @param {Client} client - Discord.js Client.
 * @param {Message} message - Discord.js Message.
 */
module.exports.run = async (client, message) => {
	const usage = client.commands.filter(cmd => cmd.help.used).map(cmd => cmd.help.name + ' : ' + cmd.help.used);
	if(usage.length) return message.channel.send(usage);
	else message.channel.send('No usage!');
};


module.exports.help = {
	name: 'usage',
	description: 'shows your bot usage',
	hideinhelp: true,
	aliases: [],
	requires: ['botowner'],
	cooldown: '1ms',
	category: 'default',
};

