const models = require('./../../models');
const Trophies = models.Trophies;

module.exports = {
	/**
     * Find trophy by trophy profile and url
     *
     * @param {TrophyProfile} trophyProfile
     * @param {string} trophyUrl
     *
     * @returns {Trophies|null}
     */
	findByUsernameAndUrl: async function(trophyProfile, trophyUrl) {
		return await Trophies.findOne({ where: { trophyProfile: trophyProfile.id, url: trophyUrl } });
	},

	/**
     * Create and link a trophy to a trophy profile
     *
     * @param {TrophyProfile} trophyProfile
     * @param {string} url
     * @param {int} points
     *
     * @returns {Trophies}
     */
	create: async function(trophyProfile, url, points) {
		const trophy = await this.findByUsernameAndUrl(trophyProfile, url);
		if (trophy) {
			throw new Error(url + ' has already been claimed!');
		}

		return await Trophies.create(
			{
				trophyProfile: trophyProfile.id,
				url: url,
				points: points,
			},
		);
	},
};
