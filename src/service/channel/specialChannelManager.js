const models = require('./../../models');
const SpecialChannel = models.SpecialChannel;


module.exports = {
	/**
	 * Find configurations for a channel
	 *
	 * @param {Channel} url
	 *
	 * @returns {SpecialChannel[]|null}
	 */
	findByChannel: async function(channel) {
		await SpecialChannel.findAll({ where: { channelId: channel.id } });
	},
};
