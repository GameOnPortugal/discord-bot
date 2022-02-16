const CommandChannelLinkManager = require('./../service/commandChannelLink/commandChannelLinkManager');
const Voca = require('voca');

const KeyV = require('keyv');
const keyV = new KeyV();

module.exports = {
	/**
     * Post some message / content
     *
     * @param {Object} command
     * @param {Channel} targetChannel
     * @param {Object|string} content
     *
     * @return Message
     */
	post: async function(command, targetChannel, content) {
		const commandChannelLink = await CommandChannelLinkManager.findByCommand(command.name);
		if (commandChannelLink) {
			targetChannel = await targetChannel.client.channels.fetch(commandChannelLink.channelId);
		}

		return await this.sendMessage(targetChannel, content);
	},

	/**
	 * Send a message respecting the limitations of the API (2000 chars)
	 *
	 * @param {Channel} channel
	 * @param {String} message
	 */
	sendMessage: async function(channel, message) {
		if (typeof message === 'object') {
			return await channel.send(message);
		}

		let lastMessage = '';
		while(message) {
			const limitedMessage = Voca.prune(message, 1800, '');
			message = message.substring(limitedMessage.length);

			lastMessage = await channel.send(limitedMessage);
		}

		return lastMessage;
	},

	/**
	 * Lock interaction to the user prevent multiple messages
	 *
	 * @param {string} authorId
	 *
	 * @return bool returns true if lock was successful otherwise false if an interaction is already in place?
	 */
	lockInteraction: async function(authorId) {
		const isLocked = await keyV.get('lockInteraction_' + authorId);
		if (isLocked === undefined) {
			await keyV.set('lockInteraction_' + authorId, true, 120000);

			return true;
		}

		return false;
	},

	/**
	 * Unlock interaction to the user
	 *
	 * @param {string} authorId
	 */
	releaseLockInteraction: async function(authorId) {
		await keyV.delete('lockInteraction_' + authorId);
	},
};
