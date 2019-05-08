const { Message, Client, PermissionResolvable } = require('discord.js');
class Command {
	/**
	 *
	 * @typedef {'botowner'|'guild'|'dm'} Requires
	 */
	/**
	 * @typedef {Object} cmdConstructor
	 *
	 * @property {string} name
	 * @property {string} [description]
	 * @property {Boolean} [hideinhelp=false]
	 * @property {Requires} [require=[]]
	 * @property {string} [usage]
	 * @property {Array<string>} [aliases=[]]
	 * @property {PermissionResolvable[]} [requiresBotPermissions=[]]
	 */
	/**
	 *
	 * @param {cmdConstructor} param0 - Constructor.
	 */
	constructor({
		name,
		description,
		hideinhelp = false,
		requires = [],
		usage,
		aliases = [],
		requiresBotPermissions = [],
	}) {
		if (!name) {
			throw new Error('name required for Command Class');
		}
		this.help = {};
		this.help.name = name;
		this.help.description = description;
		this.help.hideinhelp = hideinhelp;
		this.help.requires = requires;
		this.help.usage = usage;
		this.help.aliases = aliases;
		this.help.requiresBotPermissions = requiresBotPermissions;
		this.run = (client, message) => { message.channel.send('This Command does not have a Function!'); };
		return this;
	}

	/**
	 *  Callback for the Command
	 *
	 * @callback cmdCallback
	 * @param {Client} client
	 * @param {Message} message
	 * @param {String[]} args
	 * @returns {any}
	 */
	/**
	 *  Assigns the command executor function to the callback provided.
	 *
	 * @param {cmdCallback} callback - Callback for the Command.
	 * @returns {Command} Command Class.
	 */
	execute(callback) {
		this.run = callback;
		return this;
	}
}
module.exports = Command;
