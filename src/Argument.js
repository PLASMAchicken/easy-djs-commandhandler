const discord = require('discord.js');
class Argument {
	/**
	 * @typedef {{key:string,prompt:string,type:ArgumentTypes,default?:string,time?:number,attempts?:number,errorMsg?:string}} ArgumentInfo
	 *
	 */
	/**
	 *
	 * @param {ArgumentInfo} info - Argument Info Options.
	 */
	constructor(info = {}) {
		this.usedAttempts = 0;
		this.key = info.key;
		this.prompt = info.prompt;
		this.type = info.type;
		this.default = info.default;
		this.time = info.time;
		this.attempts = info.attempts;
		this.errorMsg = info.errorMsg;
	}
	/**
	 * @param {discord.Message} message - Discordjs message.
	 * @returns {{canceled:boolean,value:discord.Channel|discord.User|discord.GuildMember|discord.Message|string|discord.Role}}
	 */
	async obtain(message) {
		if(!this.key) throw new Error('Argument is missing key!');
		if(!this.prompt) throw new Error('Argument is missing prompt!');
		let value;
		await message.channel.send(this.prompt);
		const collector = await message.channel.awaitMessages(
			(x) => x.author.id == message.author.id,
			{ max: 1, time: this.time }
		);
		if (collector && collector.size) {
			if (this.type == 'channel') {
				value =
					collector.first().mentions.channels.first() ||
					collector
						.first()
						.guild.channels.get(collector.first().content);
			}
			else if (this.type == 'member') {
				value =
					collector.first().mentions.members.first() ||
					collector
						.first()
						.guild.members.get(collector.first().content);
			}
			else if (this.type == 'role') {
				value =
					collector.first().mentions.roles.first() ||
					collector
						.first()
						.guild.roles.get(collector.first().content);
			}
			else if (this.type == 'string') {
				value = collector.first().content;
			}
			else if (this.type == 'user') {
				value = collector.first().mentions.users.first();
			}
			else {
				value = collector.first();
			}
			if (collector.first().content == 'cancel') {
				return { canceled: true, value: null };
			}
			if (!value) {
				await message.channel.send(
					this.errorMsg || 'it seems that is not the correct answer'
				);
				if (this.attempts && this.usedAttempts < this.attempts) {
					this.usedAttempts++;
					return this.obtain(message);
				}
				else if (
					this.attempts &&
					this.usedAttempts >= this.attempts
				) {
					this.usedAttempts = 0;
					return { canceled: false, value: null };
				}
				return this.obtain(message);
			}
			else {
				return { canceled: false, value };
			}
		}
		else {
			return { canceled: false, value: undefined };
		}
	}
}
class Collector {
	/**
	 * @typedef {'channel'|'user'|'member'|'role'|'string'} ArgumentTypes
	 *
	 */
	/**
	 *
	 * @param {ArgumentInfo[]} args - Arguemts.
	 */
	constructor(args = [{}]) {
		/**
		 * @type {Argument[]}
		 */
		this.args = [];
		this.waiting = new Set();
		for (const i of args) {
			const arg = new Argument(i);
			this.args.push(arg);
		}
	}
	/**
	 *
	 * @param {discord.Message} message - Discord.js Message.
	 * @returns
	 */
	async obtain(message) {
		this.waiting.add(message.author.id + message.channel.id);
		const values = {};
		try {
			for (const i of this.args) {
				const result = await i.obtain(message);
				if (result.canceled) {
					this.waiting.delete(message.author.id + message.channel.id);
					return { values: null, canceled: result.canceled };
				}
				values[i.key] = result.value;
			}
		}
		catch (err) {
			this.waiting.delete(message.author + message.channel.id);
			throw err;
		}
		return { values, canceled: false };
	}
}
module.exports = Collector;
