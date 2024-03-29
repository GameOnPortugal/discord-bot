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
	 * @param {object} data
	 *
	 * @returns {Promise<CreateOptions<Model["_attributes"]> extends ({returning: false} | {ignoreDuplicates: true}) ? void : Model>}
	 */
	create: function(data) {
		return Ad.create(data);
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
	 * Find the oldest ADs in the database max 1 per user on each iteration
	 *
	 * @returns {Promise<Model[]>}
	 */
	findOldestAds: async function() {
		const now = dayjs().subtract(1, 'week');

		return Ad.findAll({
			where: {
				createdAt: {
					[models.Sequelize.Op.lt]: now.toDate(),
				},
			},
			order: [
				['createdAt', 'ASC'],
			],
			group: ['author_id'],
		});
	},

	/**
	 * Find ALL the oldest ADs in the database for the given user
	 */
	findOldestAdsByUser: async function(author_id) {
		const now = dayjs().subtract(1, 'week');

		return Ad.findAll({
			where: {
				createdAt: {
					[models.Sequelize.Op.lt]: now.toDate(),
				},
				author_id: author_id,
			},
			order: [
				['createdAt', 'ASC'],
			],
		});
	},
};
