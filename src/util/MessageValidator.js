const models = require('./../models');
const SpecialChannel = models.SpecialChannel;

const KeyV = require('keyv');
const keyV = new KeyV();

const MessageValidator = {
	/**
     * Find all restrictions for a channel id
     *
     * @param {String} channelId
     * @returns {Promise<SpecialChannel[]|null>}
     */
	findRestrictions: async function(channelId) {
		let restrictions = await keyV.get('channel.' + channelId);

		// If it isn't on cache, get restrictions and cache them in memory
		if (undefined === restrictions) {
			restrictions = await SpecialChannel.findAll({ where: { channelId: channelId } });

			// Save memory cache that channel doesn't have restrictions
			await keyV.set('channel.' + channelId, restrictions);
		}

		return restrictions.length ? restrictions : null;
	},

	/**
     * Check whether or not a message is valid
     *
     * @param message
     * @returns {boolean}
     */
	validate: async function(message) {
		const restrictions = await this.findRestrictions(message.channel.id);
		if (!restrictions) {
			return true;
		}

		try {
			for (const restriction of restrictions) {
				const handler = require('./../service/messageValidator/handler/' + restriction.specialType);
				if (await handler.handle(restriction, message) === false) {
					console.log('Handler "' + restriction.specialType + '" refused message!');

					return false;
				}
			}
		}
		catch (error) {
			console.error(error);

			return true;
		}

		return true;
	},

	/**
     * Clean memory cache regarding restrictions for channels
     *
     * @param {string} channelId
     *
     * @returns {Promise<void>}
     */
	cleanCache: async function(channelId) {
		// Remove whatever cache from this channel id
		await keyV.delete('channel.' + channelId);
	},
};

module.exports = MessageValidator;
