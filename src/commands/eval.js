/* eslint no-unused-vars: 0  */
const Discord = require('discord.js');

const cblockre = /(^```js)|(```$)/g;

const { Client, Message } = require('discord.js');
/**
 * @param {Client} client - Discord.js Client
 * @param {Message} message - Discord.js Message
 * @param {Array} args - Array with parsed args
 */
module.exports.run = async (client, message, args) => {
	try {
		let content = args.join(' ');
		if (cblockre.test(content)) {
			content = content.replace(cblockre, '').trim();
		}
		let evaled = eval(content);

		if (typeof evaled !== 'string') {evaled = require('util').inspect(evaled);}


		const wrapped = `${message.author}\n\`\`\`js\n${evaled.length > 1800 ? evaled.slice(0, 1800) + '\n...' : evaled}\n\`\`\``;
		await message.channel.send(wrapped);
		console.log(evaled);
	}
	catch (err) {
		message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
	}
};


module.exports.help = {
	name: 'eval',
	description: 'evals code',
	hideinhelp: false,
	aliases: ['e'],
	requires: ['botowner'],
	cooldown: '1ms',
	category: 'default',
};

