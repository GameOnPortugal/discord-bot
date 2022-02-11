const CommandChannelLinkManager = require('./../service/commandChannelLink/commandChannelLinkManager');
const Voca = require('voca');

const KeyV = require('keyv');
const keyV = new KeyV();

module.exports = {
	/**
     * Post some message / content
     *
     * @param {Object} command
     * @param {Message} message
     * @param {Object|string} content
     *
     * @return {Promise<Message>}
     */
	post: async function(command, message, content) {
		const commandChannelLink = await CommandChannelLinkManager.findByCommand(command.name);
		let targetChannel = message.channel;
		if (commandChannelLink) {
			targetChannel = await message.client.channels.fetch(commandChannelLink.channelId);
		}


	},

	/**
	 * Send a message respecting the limitations of the API (2000 chars)
	 *
	 * @param {Object} channel
	 * @param {String} message
	 */
	sendMessage: async function(channel, message) {
		while(message) {
			let limitedMessage = Voca.prune(message, 1800, '');
			message = message.substring(limitedMessage.length);

			await channel.send(limitedMessage);
		}
	},

	/**
	 * Lock interaction to the user prevent multiple messages
	 *
	 * @param {string} authorId
	 *
	 * @return bool returns true if lock was successful otherwise false if an interaction is already in place?
	 */
	lockInteraction: async function(authorId)
	{
		let isLocked = await keyV.get('lockInteraction_'+authorId)
		if (isLocked === undefined) {
			await keyV.set('lockInteraction_'+authorId, true, 120000);

			return true;
		}

		return false;
	},

	/**
	 * Unlock interaction to the user
	 *
	 * @param {string} authorId
	 */
	releaseLockInteraction: async function(authorId)
	{
		await keyV.delete('lockInteraction_'+authorId);
	},

};
