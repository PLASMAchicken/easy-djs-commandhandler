const ms = require('ms');
const { Client, Message } = require('discord.js');
/**
 * @param {Client} client - Discord.js Client.
 * @param {Message} message - Discord.js Message.
 * @param {Array} args - Array with parsed args.
 */
module.exports.run = async (client, message, args) => {
	if(!args.length) {
		return message.author.send(
			client.commands.map(props => props.help.hideinhelp ? '' : `**Command: ${props.help.name}**\n${props.help.category ? `\tCategory: ${props.help.category}\n` : '' }${props.help.description ? `\tDescription: ${props.help.description}\n` : '' }${props.help.usage ? `\tUsage: ${client.format(props.help.usage)}\n` : '' }${props.help.aliases ? `\tAliases: [ ${props.help.aliases.join(', ')} ]\n` : '' }`).filter(data => data !== '')
			, { split: { char: '\n\n' } })
			.then(() => {
				if (message.channel.type === 'dm') return;
				message.reply('I\'ve sent you a DM with all my commands!');
			})
			.catch(error => {
				message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				if(error.code != 50007) throw new Error(`Could not send help DM to ${message.author.tag}.\n` + error);
			});
	}
	const cmd = args.join(' ').toLowerCase();
	const command = client.commands.get(cmd) || client.commands.find(commanda => commanda.help.aliases && commanda.help.aliases.includes(cmd));
	const category = client.commands.filter(commanda => commanda.help.category && commanda.help.category.toLowerCase() == cmd);
	if (!command && !category.size) return message.reply('That\'s not a valid command/category!');
	if(command) {
		const helpcmd = [];
		helpcmd.push(`**Name:** ${command.help.name}`);
		if (command.help.category) helpcmd.push(`**Category:** ${command.help.category}`);
		if (command.help.aliases) helpcmd.push(`**Aliases:** [${command.help.aliases.join(', ')}]`);
		if (command.help.description) helpcmd.push(`**Description:** ${command.help.description}`);
		if (command.help.usage) helpcmd.push(`**Usage:** ${client.format(command.help.usage)}`);
		if (command.help.cooldown) helpcmd.push(`**Cooldown:** ${ms(ms(command.help.cooldown), { long : true })}`);
		message.channel.send(helpcmd, { split: true });
	}
	if(category.size) 	{
		return message.author.send(
			category.map(props => props.help.hideinhelp ? '' : `**Command: ${props.help.name}**\n${props.help.category ? `\tCategory: ${props.help.category}\n` : '' }${props.help.description ? `\tDescription: ${props.help.description}\n` : '' }${props.help.usage ? `\tUsage: ${client.format(props.help.usage)}\n` : '' }${props.help.aliases ? `\tAliases: [ ${props.help.aliases.join(', ')} ]\n` : '' }`).filter(data => data !== '').join(' ')
			, { split: { char: '\n\n' } })
			.then(() => {
				if (message.channel.type === 'dm') return;
				message.reply('I\'ve sent you a DM with all my commands!');
			})
			.catch(error => {
				message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				if(error.code != 50007) throw error;
			});
	}
};

module.exports.help = {
	name: 'help',
	description: 'Shows all the commands',
	usage: '<prefix>help or <prefix>help <command||category>',
	aliases: '',
	category: 'default',
};