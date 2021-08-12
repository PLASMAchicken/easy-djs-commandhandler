const fs = require('fs');
const { Message, Client, Collection, Interaction, SnowflakeUtil, CommandInteraction } = require('discord.js');
const ms = require('ms');
const sleep = require('util').promisify(setTimeout);
class CommandHandler {

	/**
	* Callback for adding two numbers.
	*
	* @callback prefixFunc
	* @param {Message} message - The Message we need the prefix for.
	* @param {Client} client - The Client.
	* @returns {Strings} - The prefix that will be used.
	*/
	/**
 	* Options for the Coammnd Handler.
	 *
 	* @typedef {object} HandlerSettings
	*
	* @property {string} [prefix=!] Prefix.
 	* @property {Array} [owner=[]] Array of ids with Bot Perms.
	* @property {string} [folder=commands] Folder where the Commands are in.
	* @property {*} [cooldowns=true] - If Cooldowns are Enabled, either true/false, or Collection.
	* @property {boolean} [defaultcmds=true] - Load Default Commands.
	* @property {string} [maxWait='2s'] - Max Time to wait for Cooldown.
	* @property {string} [defaultCooldown='5s'] - Default Cooldown if Command does not overwrite it.
	* @property {prefixFunc} [prefixFunc] - Function wich returns a string and selects the prefix.
	* @property {boolean} [logArgs] - Log arguments passed to each command.
	 */
	/**
	* Module to run and handle Commands.
	*
	* @param {Client} client - Discord.js Client.
	* @param {HandlerSettings} settings - Settings Object.
	* @example new commandhandler(client, { prefix: '?', owner: ['193406800614129664'], folder: 'cmds' });
	*/
	constructor(client, settings) {
		if(!client) throw new TypeError('Need Discord#Client');
		let errorc = 0;
		if(!settings) settings = {};
		if(!settings.folder) settings.folder = 'commands';
		if(!settings.prefix) settings.prefix = '!';
		if(!settings.defaultCooldown) settings.defaultCooldown = '5s';
		if(!settings.maxWait) settings.maxWait = 2000;
		else settings.maxWait = ms(settings.maxWait);
		if(settings.cooldowns === undefined) settings.cooldowns = true;
		if(settings.cooldowns === true) {
			settings.cooldowns = new Collection();
			client.cooldowns = settings.cooldowns;
		}
		else {client.cooldowns = settings.cooldowns;}

		if(settings.logArgs == undefined)settings.logArgs = false;

		if(settings.defaultcmds !== false) settings.defaultcmds = true;
		if(settings.owners && !settings.owner) settings.owner = settings.owners;
		if(!settings.owner) client.owners = [];
		else if (typeof settings.owner == 'string') client.owners = [settings.owner];
		else if (Array.isArray(settings.owner)) client.owners = settings.owner;
		else client.owners = [];
		if(!client.prefix) client.prefix = settings.prefix;
		else settings.prefix = client.prefix;
		this.settings = settings;
		if(!client.commands) client.commands = new Collection();
		if(!client.format) {
			client.format = function(string) {
				string = string.replace(/<prefix>/g, client.prefix);
				string = string.replace(/<mention>/g, client.user.toString());
				return string;
			};
		}

		fs.readdir(`./${settings.folder}/`, (err, files) => { // read dir
			if(err) { // err =>
				if (err.errno == -4058) { // err code = -4058 => dir not present
					fs.mkdirSync(`./${settings.folder}/`); // => make dir
					console.log(`Command Folder was not found! Creating ./${settings.folder}/ \n Please restart Bot!`); // => log
					return process.exit(); // => return
				}
				else{ // Unknow Error =>
					throw err;
				}
			}

			const jsfile = files.filter(f => f.split('.').pop() === 'js' && !fs.statSync(process.cwd() + `/${settings.folder}/` + f).isDirectory()); // get all .js files
			const categorys = files.filter(f => fs.statSync(process.cwd() + `/${settings.folder}/` + f).isDirectory());
			if (jsfile.length <= 0 && categorys.length <= 0) { // if no commands present
				console.log(' Couldn\'t find commands.'); // log no commands => close commandhandler and start client
			}

			console.log('-------------------------------\nStarting to load Commands!');
			jsfile.forEach((f, i) => { // if commands present
				try{
					const props = require(`${process.cwd()}/${settings.folder}/${f}`); // => load each one

					console.log(`${i} ${f} loaded!`); // => log that command got loaded
					if(props.help.aliases && !Array.isArray(props.help.aliases)) props.help.aliases = [props.help.aliases];
					client.commands.set(props.help.name, props); // => add command to command list
				}
				catch(err) {
					errorc++;
					console.error(`${i} ${f} failed to load!\n${err}\n${err.stack}\n`);
				}
			});

			console.log('Commands loaded or none found!\n-------------------------------\nStarting to load Categorys!');
			categorys.forEach(category =>{
				const catfiles = fs.readdirSync(`./${settings.folder}/` + category).filter(f => f.split('.').pop() === 'js' && !fs.statSync(process.cwd() + `/${settings.folder}/` + category + '/' + f).isDirectory());
				catfiles.forEach((f, i) => {
					try{
						const props = require(`${process.cwd()}/${settings.folder}/${category}/${f}`); // => load each one

						console.log(`${i} ${f} in category ${category} loaded!`); // => log that command got loaded
						props.help.category = category;
						if(props.help.aliases && !Array.isArray(props.help.aliases)) props.help.aliases = [props.help.aliases];
						client.commands.set(props.help.name, props); // => add command to command list
					}
					catch(err) {
						errorc++;
						console.error(`${i} ${f} failed to in ${category} load!\n${err}\n${err.stack}\n`);
					}
				});
				console.log(`-------------------------------\nCategory ${category} loaded or none found!\n-------------------------------`);
			});


			console.log('Categorys loaded or none found!\n-------------------------------');
			loadBaseCMD(client, 'help', this.settings);
			loadBaseCMD(client, 'eval', this.settings);
			loadBaseCMD(client, 'usage', this.settings);

			console.log(`${client.commands.size} Commands loaded! ${errorc == 0 ? '' : `${errorc} Error occured!` }`);

		/*
			const { SlashCommandBuilder } = require('@discordjs/builders');

			const commands = client.commands.map(x => {
				const data = new SlashCommandBuilder()
					.setName(x.help.name)
					.setDescription(x.help.description)

					.addStringOption(option =>
						option.setName('input')
							.setDescription('placeholder')
							.setRequired(false));
				if(x.help && x.help.hideinhelp) {
					data.defaultPermission = false;

					data.permissions = [{
						id: '692887270491160597',
						type: 'ROLE',
						permission: true,
					}];
				}
				return data;


			});
			client.guilds.cache.get('471361190732365824').commands.set(commands).then(cmds=> {

				client.guilds.cache.get('471361190732365824').commands.cache.forEach(cmd => {
					console.log(cmd.name);
					const command = client.commands.get(cmd.name);
					if(command.help && command.help.hideinhelp) {


						const permissions = [{
							id: '692887270491160597',
							type: 'ROLE',
							permission: true,
						}];


						cmd.permissions.set({ permissions });
					}
				});
			});*/
		}); // => close commandhandler and start client
	}

	/**
 	* Module to run and handle Commands.
 	*
 	* @param {Client} client - Discord Client.
 	* @param {CommandInteraction} interaction - Interagtion Object to handle Command in.
 	* @example commandhandler.run(client, message);
 	*/
	async handleInteraction(client, interaction) {
		const content = client.prefix + interaction.commandName + ' ' + (interaction.options.getString('input') ? interaction.options.getString('input') : '');

		const message = new Message(client, {
			channel_id: interaction.channelId,
			id: SnowflakeUtil.generate(),
			guild_id: interaction.guildId,
			member: interaction.member.toJSON(),
			author: interaction.user,
			content: content,
		}, client.channels.cache.get(interaction.channelId));
		console.log(message.content);
		console.log(message.mentions);

		interaction.reply({ content: 'Simulating command:\n' + content });

		if(message.guild && !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;
		if (message.system || message.author.bot) return;
		let prefixRegex;
		if(this.settings.prefixFunc) {
			prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${(await this.settings.prefixFunc(message, client) || client.prefix).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\s*`);
		}
		else	{
			prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${client.prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\s*`);
		}

		if (!prefixRegex.test(message.content)) return;
		const [, matchedPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const cmdname = args.shift().toLowerCase();
		const cmd = client.commands.get(cmdname) || client.commands.find(com => com.help.aliases && com.help.aliases.includes(cmdname));

		function getUserFromMention(mention) {
			if (!mention) return;

			if (mention.startsWith('<@') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);

				if (mention.startsWith('!')) {
					mention = mention.slice(1);
				}

				return client.users.cache.get(mention);
			}
		}
		message.mentions.users = new Collection();
		args.forEach(arg => {
			const data = getUserFromMention(arg);
			if(data) {
				message.mentions.users.set(data.id, data);
			}
		});


		if (cmd) {
			message.channel.sendTyping();

			const logArgs = this.settings.logArgs ? ' [\'' + args.join('\',\'') + '\']' : '';
			console.log(`[Ping:${Math.round(client.ws.ping)}ms] ${cmd.help.name}${logArgs} request by ${message.author.username} @ ${message.author.id} `); // if command can run => log action

			if (cmd.help.requires) {
				if (cmd.help.requires.includes('botowner')) if (!client.owners.includes(message.author.id)) return message.reply('This command cannot be used by you!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Bot Owner! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('guild') && message.channel.type !== 'GUILD_TEXT') return message.channel.send('This command needs to be run in a guild!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Guild! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('dm') && message.channel.type !== 'dm') return message.channel.send('This command needs to be run in DMs!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not DM! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('guildowner') && message.author.id !== message.guild.owner.id) return message.channel.send('This command can only be run by the guild owner!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Guild Owner! `), message.channel.stopTyping(true);
			}
			if(cmd.help.requiresBotPermissions && cmd.help.requiresBotPermissions.length) {
				let missing = ['ERROR'];
				if(message.guild) {
					missing = cmd.help.requiresBotPermissions.filter(permission => !message.channel.permissionsFor(message.guild.me).has(permission));
				}
				else {
					missing = cmd.help.requiresBotPermissions.filter(permission => !['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS ', 'ATTACH_FILES'].includes(permission));
				}
				if(missing.length)return message.reply(`I am missing the following Permissions to execute this Command: ${missing.map(x => `\`${x}\``).join(', ')}`), message.channel.stopTyping(true);
			}
			if(cmd.help.requireUserPermissions && cmd.help.requireUserPermissions.length) {
				let missing = ['ERROR'];
				if(message.guild) {
					missing = cmd.help.requireUserPermissions.filter(permission => !message.channel.permissionsFor(message.member).has(permission));
				}
				else {
					missing = cmd.help.requireUserPermissions.filter(permission => !['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS ', 'ATTACH_FILES'].includes(permission));
				}
				if(missing.length)return message.reply(`You are missing the following Permissions to execute this Command: ${missing.map(x => `\`${x}\``).join(', ')}`), message.channel.stopTyping(true);
			}
			if(client.cooldowns) {
				if(await checkForCooldown(client, cmd, message, this.settings)) return;
			}
			if(!cmd.help.used) cmd.help.used = 0;
			cmd.help.used += 1;
			cmd.run(client, message, args);
			if (cmd.help.category === 'indevelopment' && !client.owners.includes(message.author.id)) message.reply('Just a quick sidenote:\nThis Command is still indevelopment and might be unstable or even broken!');
		}
	}

	/**
 	* Module to run and handle Commands.
 	*
 	* @param {Client} client - Discord Client.
 	* @param {Message} message - Message Object to handle Command in.
 	* @example commandhandler.run(client, message);
 	*/
	async handleMessage(client, message) {
		if(message.guild && !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;
		if (message.system || message.author.bot) return;
		let prefixRegex;
		if(this.settings.prefixFunc) {
			prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${(await this.settings.prefixFunc(message, client) || client.prefix).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\s*`);
		}
		else	{
			prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${client.prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\s*`);
		}

		if (!prefixRegex.test(message.content)) return;
		const [, matchedPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const cmdname = args.shift().toLowerCase();
		const cmd = client.commands.get(cmdname) || client.commands.find(com => com.help.aliases && com.help.aliases.includes(cmdname));
		if (cmd) {
			message.channel.sendTyping();

			const logArgs = this.settings.logArgs ? ' [\'' + args.join('\',\'') + '\']' : '';
			console.log(`[Ping:${Math.round(client.ws.ping)}ms] ${cmd.help.name}${logArgs} request by ${message.author.username} @ ${message.author.id} `); // if command can run => log action

			if (cmd.help.requires) {
				if (cmd.help.requires.includes('botowner')) if (!client.owners.includes(message.author.id)) return message.reply('This command cannot be used by you!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Bot Owner! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('guild') && message.channel.type !== 'GUILD_TEXT') return message.channel.send('This command needs to be run in a guild!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Guild! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('dm') && message.channel.type !== 'dm') return message.channel.send('This command needs to be run in DMs!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not DM! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('guildowner') && message.author.id !== message.guild.owner.id) return message.channel.send('This command can only be run by the guild owner!'), console.log(`[Ping:${Math.round(client.ws.ping)}ms]${client.shard ? ` [Shard: #${client.shard.ids}]` : ''} ${cmd.help.name} failed!: Not Guild Owner! `), message.channel.stopTyping(true);
			}
			if(cmd.help.requiresBotPermissions && cmd.help.requiresBotPermissions.length) {
				let missing = ['ERROR'];
				if(message.guild) {
					missing = cmd.help.requiresBotPermissions.filter(permission => !message.channel.permissionsFor(message.guild.me).has(permission));
				}
				else {
					missing = cmd.help.requiresBotPermissions.filter(permission => !['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS ', 'ATTACH_FILES'].includes(permission));
				}
				if(missing.length)return message.reply(`I am missing the following Permissions to execute this Command: ${missing.map(x => `\`${x}\``).join(', ')}`), message.channel.stopTyping(true);
			}
			if(cmd.help.requireUserPermissions && cmd.help.requireUserPermissions.length) {
				let missing = ['ERROR'];
				if(message.guild) {
					missing = cmd.help.requireUserPermissions.filter(permission => !message.channel.permissionsFor(message.member).has(permission));
				}
				else {
					missing = cmd.help.requireUserPermissions.filter(permission => !['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS ', 'ATTACH_FILES'].includes(permission));
				}
				if(missing.length)return message.reply(`You are missing the following Permissions to execute this Command: ${missing.map(x => `\`${x}\``).join(', ')}`), message.channel.stopTyping(true);
			}
			if(client.cooldowns) {
				if(await checkForCooldown(client, cmd, message, this.settings)) return;
			}
			if(!cmd.help.used) cmd.help.used = 0;
			cmd.help.used += 1;
			cmd.run(client, message, args);
			if (cmd.help.category === 'indevelopment' && !client.owners.includes(message.author.id)) message.reply('Just a quick sidenote:\nThis Command is still indevelopment and might be unstable or even broken!');
		}
	}
}
/**
 * Function to load Base Commmands that come with the Package.
 *
 * @private
 * @param {Client} client - Discord.JS Client.
 * @param {string} cmd - Name of Commmand to load.
 * @param {HandlerSettings} settings - Settings Object.
 */
function loadBaseCMD(client, cmd, settings) {
	if(!client.commands.has(cmd) && settings.defaultcmds) {
		const props = require(`./commands/${cmd}.js`); // => load each one

		console.log(`Loaded Default Command: ${cmd}`); // => log that command got loaded
		client.commands.set(props.help.name, props); // => add command to command list
	}
}
/**
 * Function to check for Cooldowns.
 *
 * @private
 * @param {Client} client - Discord.JS Client.
 * @param {object} cmd - Command.
 * @param {Message} message - Message.
 * @param {HandlerSettings} settings - Settings Object.
 */
async function checkForCooldown(client, cmd, message, settings) {
	const cooldowns = client.cooldowns.get(message.author.id) || {};
	const now = Date.now();
	const cooldownAmount = ms(cmd.help.cooldown || settings.defaultCooldown);
	const cooldownName = cmd.help.cooldownGroup || cmd.help.name;
	if (!cooldowns[cooldownName]) cooldowns[cooldownName] = now - cooldownAmount;
	const cooldown = cooldowns[cooldownName];
	const expirationTime = cooldown + cooldownAmount;
	if (now < expirationTime) {
		const msLeft = expirationTime - now;
		const timeLeft = ms(msLeft, {
			long: true,
		});
		if(msLeft > settings.maxWait) {
			message.reply(`Please wait \`${timeLeft}\` before reusing the \`${cmd.help.name}\` command.`);
			message.channel.stopTyping(true);
			return true;
		}
		else {
			await sleep(msLeft);
			return await checkForCooldown(client, cmd, message, settings);
		}
	}
	cooldowns[cooldownName] = now;
	client.cooldowns.set(message.author.id, cooldowns);
	return false;
}
module.exports = CommandHandler;
