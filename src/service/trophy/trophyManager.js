const models = require('./../../models');
const Trophies = models.Trophies;

/**
 * Based on the percentage of the trophy convert it to points
 *
 * @param {int} percentage
 *
 * @returns {int}
 */
function transformPercentageIntoPoints(percentage) {
	if (percentage > 30.01) {
		return 50;
	}
	if (percentage > 15.01) {
		return 100;
	}
	if (percentage > 8.01) {
		return 250;
	}
	if (percentage > 5.01) {
		return 500;
	}
	if (percentage > 2.01) {
		return 800;
	}
	if (percentage > 0.6) {
		return 1250;
	}

	return 2000;
}

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
     * @param {Object<int,dayjs>} trophyData
     *
     * @returns {Trophies}
     */
	create: async function(trophyProfile, url, trophyData) {
		const trophy = await this.findByUsernameAndUrl(trophyProfile, url);
		if (trophy) {
			throw new Error(url + ' has already been claimed!');
		}

		return await Trophies.create(
			{
				trophyProfile: trophyProfile.id,
				url: url,
				points: transformPercentageIntoPoints(trophyData.percentage),
				completionDate: trophyData.completionDate.format('YYYY-MM-DD')
			},
		);
	},
};
