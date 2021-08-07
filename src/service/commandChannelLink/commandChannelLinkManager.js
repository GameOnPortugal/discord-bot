const models = require('./../../models');
const CommandChannelLink = models.CommandChannelLink;

const KeyV = require('keyv');
const keyV = new KeyV();

module.exports = {
	/**
	 * Find all associations with a channel
	 *
	 * @param {string} channelId
	 *
	 * @returns {CommandChannelLink[]|null}
	 */
	findAll: async function(channelId) {
		let commandAssociations = await keyV.get('channel.command_associations.' + channelId);

		// If it isn't on cache, get command associations and cache them in memory
		if (undefined === commandAssociations) {
			commandAssociations = await CommandChannelLink.findAll({ where: { channelId: channelId } });

			// Save command assocations to memory so we don't over spam DB
			await keyV.set('channel.command_associations.' + channelId, commandAssociations);
		}

		return commandAssociations.length ? commandAssociations : null;
	},

	/**
	 * Create an association between a command and a channel
	 *
	 * @param {Array} data
	 *
	 * @returns {Promise<CommandChannelLink>}
	 */
	create: async function(data) {
		this.cleanCache(data.channelId);

		return CommandChannelLink.create(data);
	},

	/**
	 * Delete all command associations with a channel
	 *
	 * @param {string} channelId
	 *
	 * @returns {Promise<number>}
	 */
	deleteAll: function(channelId) {
		this.cleanCache(channelId);

		return CommandChannelLink.destroy({ where: { channelId: channelId } });
	},

	/**
	 * Delete all command associations with a channel
	 *
	 * @param {string} channelId
	 * @param {string} id
	 *
	 * @returns {Promise<number>}
	 */
	delete: function(channelId, id) {
		this.cleanCache(channelId);

		return CommandChannelLink.destroy({ where: { channelId: channelId, id: id } });
	},

	/**
	 * Clean memory cache regarding command association for channels
	 *
	 * @param {string} channelId
	 */
	cleanCache: function(channelId) {
		// Remove whatever cache from this channel id
		keyV.delete('channel.command_associations.' + channelId);
	},
};
