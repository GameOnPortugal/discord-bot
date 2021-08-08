const CommandChannelLinkManager = require('./../service/commandChannelLink/commandChannelLinkManager');

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

		return targetChannel.send(content);
	},
};
