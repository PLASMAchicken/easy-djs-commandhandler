/* eslint no-unused-vars: 0  */
const Discord = require('discord.js');
class Command {
    /**
     * 
     * @typedef {'botowner'|'guild'|'dm'} Requires
     */
	/**
	 *
	 * @param {{name:string,description:string,hideinhelp:boolean,requires:Requires[],usage:string,aliases:Array<string>}} param0
	 */
	constructor({
		name,
		description,
		hideinhelp = false,
		requires = [],
		usage,
		aliases = [],
	}) {
		if (!name) {
			throw new Error('name required for Command Class');
        }
        this.help={}
		this.help.name = name;
		this.help.description = description;
		this.help.hideinhelp = hideinhelp;
		this.help.requires = requires;
		this.help.usage = usage;
		this.help.aliases = aliases;
		this.run = () => {};
	}
	/**
	 *  assigns the command executor function to the callback provided
	 * @param {(client:Discord.Client,message:Discord.Message,args:string[])=>void} callback
	 */
	execute(callback) {
		this.run = callback;
	}
}
module.exports=Command