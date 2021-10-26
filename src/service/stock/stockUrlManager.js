const models = require('./../../models');
const StockUrls = models.StockUrls;

module.exports = {
	/**
	 * Find a profile by discord username
	 *
	 * @param {string} url
	 *
	 * @returns {TrophyProfile|null}
	 */
	findByUrl: async function(url) {
		return await StockUrls.findOne({ where: { url: url } });
	},

	/**
     * Create and link a discord user with a trophy profile
     *
     * @param {User} author
	 * @param {string} url
     *
     * @returns {StockUrls}
     */
	create: async function(author, url) {
		const stockUrl = await this.findByUrl(url);
		if (stockUrl) {
			throw new Error('That url already exists!');
		}

		return await StockUrls.create(
			{
				userId: author.id,
				url: url,
			},
		);
	},
};
