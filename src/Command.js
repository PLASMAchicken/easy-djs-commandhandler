// eslint-disable-next-line no-unused-vars
const discord = require('discord.js');
class Command {
	/**
	 * @typedef {Object} cmdConstructor
	 *
	 * @property {string} name - The Command name, used for <prefix><command.name>.
	 * @property {string} [description] - The Command Description, for the help command.
	 * @property {Boolean} [hideinhelp] - Should the Command be hidden for normal users in help?
	 * @property {('botowner'|'guild'|'dm'|'guildowner')[]} [requires] - Does the Command require a guild/dm or botowner?
	 * @property {string} [usage] - The Command Usage, for the help command.
	 * @property {string} [cooldown] - The Cooldown Overwrite.
	 * @property {Array<string>} [aliases] - The Aliases, used for <prefix><command.alias>.
	 * @property {discord.PermissionResolvable[]} [requiresBotPermissions] - Permissions that the bot needs.
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
		cooldown,
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
		this.help.cooldown = cooldown;
		this.help.aliases = aliases;
		this.help.requiresBotPermissions = requiresBotPermissions;
		this.run = (client, message) => { message.channel.send('This Command does not have a Function!'); };
		return this;
	}

	/**
	 *  Callback for the Command
	 *
	 * @callback cmdCallback
	 * @param {discord.Client} client
	 * @param {discord.Message} message
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
