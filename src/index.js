const fs = require('fs');
const { Message, Client, Collection } = require('discord.js');
const ms = require('ms');
class CommandHander {
	/**
 	* Options for the Coammnd Handler.
 	* @typedef {Object} HandlerSettings
	*
	* @property {string} [prefix=!] Prefix.
 	* @property {Array} [owner=[]] Array of ids with Bot Perms.
	* @property {string} [folder=commands] Folder where the Commands are in.
	* @property {*} [cooldowns=true] - If Cooldowns are Enabled, either true/false, or Collection
	* @property {boolean} [defaultcmds=true] - Load Default Commands.
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
		if(settings.cooldowns === undefined) settings.cooldowns = true;
		if(settings.cooldowns === true) {
			settings.cooldowns = new Collection();
			client.cooldowns = settings.cooldowns;
		}
		else {client.cooldowns = settings.cooldowns;}

		if(settings.defaultcmds !== true) settings.defaultcmds = false;
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
						const props = require(`../${settings.folder}/${category}/${f}`); // => load each one

						console.log(`${i} ${f} in category ${category} loaded!`); // => log that command got loaded
						props.help.category = category;
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

			console.log(`${client.commands.size} Commands loaded! ${errorc == 0 ? '' : `${errorc} Error occured!` }`);
		}); // => close commandhandler and start client
	}

	/**
 	* Module to run and handle Commands.
 	*
 	* @param {Client} client - Discord Client.
 	* @param {Message} message - Message Object to handle Command in.
 	* @example commandhandler.run(client, message);
 	*/
	handle(client, message) {
		if (message.system) return;
		if (message.author.bot) return;
		const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${client.prefix})\\s*`);
		if (!prefixRegex.test(message.content)) return;
		const [, matchedPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const cmdname = args.shift().toLowerCase();
		const cmd = client.commands.get(cmdname) || client.commands.find(com => com.help.aliases && com.help.aliases.includes(cmdname));
		if (cmd) {
			message.channel.startTyping();
			if (cmd.help.disableindm == true) return message.channel.send('Sorry this Command is not yet supported!'), message.channel.stopTyping(true); // check if command is supported in dm if not => return
			console.log(`[Ping:${Math.round(client.ping)}ms] ${cmd.help.name} request by ${message.author.username} @ ${message.author.id} `); // if command can run => log action
			if (cmd.help.requires) {
				if (cmd.help.requires.includes('botowner')) if (!client.owners.includes(message.author.id)) return message.reply('This command cannot be used by you!'), console.log(`[Ping:${Math.round(client.ping)}ms] ${cmd.help.name} failed!: Not Bot Owner! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('guild') && message.channel.type !== 'text') return message.channel.send('This command needs to be run in a guild!'), console.log(`[Ping:${Math.round(client.ping)}ms] ${cmd.help.name} failed!: Not Guild! `), message.channel.stopTyping(true);
				if (cmd.help.requires.includes('dm') && message.channel.type !== 'dm') return message.channel.send('This command needs to be run in DMs!'), console.log(`[Ping:${Math.round(client.ping)}ms] ${cmd.help.name} failed!: Not DM! `), message.channel.stopTyping(true);
			}
			if(client.cooldowns) {
				const cooldowns = client.cooldowns.get(message.author.id) || {};
				const now = Date.now();
				const cooldownAmount = ms(cmd.help.cooldown || '5s');
				const cooldownName = cmd.help.cooldownGroup || cmd.help.name;
				if (!cooldowns[cooldownName]) cooldowns[cooldownName] = now - cooldownAmount;
				const cooldown = cooldowns[cooldownName];
				const expirationTime = cooldown + cooldownAmount;
				if (now < expirationTime) {
					const timeLeft = ms(expirationTime - now, {
						long: true,
					});
					return message.reply(`please wait \`${timeLeft}\` before reusing the \`${cmd.help.name}\` command.`), message.channel.stopTyping(true);
				}
				cooldowns[cooldownName] = now;
				client.cooldowns.set(message.author.id, cooldowns);
			}
			cmd.run(client, message, args);
			if (cmd.help.category === 'indevelopment' && !client.owners.includes(message.author.id)) message.reply('Just a quick sidenote:\nThis Command is still indevelopment and might be unstable or even broken!');
			message.channel.stopTyping(true);
		}
	}
}
const Command = require('./Command');
exports.Command = Command;
exports.Handler = CommandHander;

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