const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const discord = Discord;

const cblockre = /(^```js)|(```$)/g;
const { Command } = require('easy-djs-commandhandler');
module.exports = new Command({ name: 'eval', aliases: ['e'], requires: ['botowner'], cooldown: '1ms', hideinhelp: true, description: 'Evals Code', usage: '<prefix>e code' })
	.execute(async (client, message, args) => {
		try {
			let content = args.join(' ');
			if (cblockre.test(content)) {
				content = content.replace(cblockre, '').trim();
			}

			let evaled = await eval(content);

			if (typeof evaled !== 'string') {evaled = require('util').inspect(evaled);}
			header(message);
			console.log(evaled);
			if(evaled.length < 5000) await message.channel.send(evaled, { split: { char: '\n' }, code: 'js' });
			else message.channel.send('Evaled Result is too big, please see console!');
			header(message);
		}
		catch (err) {
			return message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
		}
	});


const header = (m, x) => {
	const H = `========== ${m.id} ==========`;
	console.log(H);
	if (x) {
		console.log(x);
		console.log(H);
	}
};
