const MessageCreatorUtil = require("../../util/messageCreatorUtil");
const models = require('./../../models');
const Ad = models.Ad;

const dayjs = require('dayjs');

module.exports = {
	/**
	 * Find ads created by an user
	 *
	 * @param {User} user
	 *
	 * @returns {Promise<Ad[]>}
	 */
	findAdsByUser: function(user) {
		return Ad.findAll({ where: { author_id: user.id } });
	},

	/**
	 * Find an ad by its ID
	 *
	 * @param {int} adId
	 *
	 * @returns {Promise<Ad>}
	 */
	findById: function(adId) {
		return Ad.findOne({ where: { id: adId } });
	},

	/**
	 * Delete an ad from the dabatase and from the channel
	 *
	 * @param {Client} client
	 * @param {int} adId
	 *
	 * @returns {Promise}
	 */
	delete: async function(client, adId) {
		const ad = await this.findById(adId);
		if (!ad) {
			throw new Error('Ad "' + adId + '" not found!');
		}

		console.log('Channel id: ' + ad.channel_id);
		console.log('Message id: ' + ad.message_id);

		try {
			await client.channels.cache.get(ad.channel_id).messages.delete(ad.message_id);
		}
		catch (e) {
			// Ignore exceptions, e.g: the post is already removed
		}

		await Ad.destroy({ where: { id: adId } });
	},

	/**
	 * Find the oldest ADs in the database
	 *
	 * @returns {Promise<Model[]>}
	 */
	findOldestAds: async function() {
		let now = dayjs().subtract(1, 'week');

		return Ad.findAll({
			where: {
				createdAt: {
					[models.Sequelize.Op.lt]: now.toDate()
				},
			},
			order: [
				['createdAt', 'ASC']
			],
			limit: 1
		});
	}
};
