const models = require('./../../models');
const sequelize = models.sequelize;
const { QueryTypes } = require('sequelize');
const TrophyProfile = models.TrophyProfile;
const Trophies = models.Trophies;

module.exports = {
	/**
     * Extracts the profile from an url
     *
     * @param {string} url
     *
     * @return {string}
     */
	getPsnProfileByUrl: function(url) {
		const urlParts = url.split('/');
		if (urlParts.length !== 6 || urlParts[urlParts.length - 1] === '') {
			throw new Error('Profile url is invalid. Expected url: https://psnprofiles.com/trophies/game/PROFILE');
		}

		return urlParts[urlParts.length - 1];
	},

	/**
     * Find profile by url
     *
     * @param {String} username
     *
     * @returns {TrophyProfile|null}
     */
	findByPsnProfile: async function(username) {
		return await TrophyProfile.findOne({ where: { psnProfile: username } });
	},

	/**
     * Create and link a discord user with a trophy profile
     *
     * @param {string} psnProfileUsername
     * @param {User} author
     *
     * @returns {TrophyProfile}
     */
	create: async function(psnProfileUsername, author) {
		const trophyProfile = await this.findByPsnProfile(psnProfileUsername);
		if (trophyProfile) {
			throw new Error(psnProfileUsername + ' is already linked to ' + (await author.client.users.fetch(trophyProfile.userId)).username);
		}

		return await TrophyProfile.create(
			{
				psnProfile: psnProfileUsername,
				userId: author.id,
			},
		);
	},

	/**
	 * Monthly ranks
	 *
	 * @param {int} limit
	 *
	 * @returns {Trophies[]}
	 */
	getTopMonthlyHunters: async function (limit)
	{
		return await sequelize.query(
			' SELECT ' +
			'	tp.userId,' +
			'	tp.psnProfile,' +
			'	SUM(t.points) points,' +
			'	COUNT(t.id) num_trophies' +
			' FROM ' +
			' 	'+TrophyProfile.tableName+' tp ' +
			' 	INNER JOIN '+Trophies.tableName+' t ON t.trophyProfile = tp.id ' +
			' WHERE ' +
			'	t.completionDate BETWEEN DATE_ADD(DATE_ADD(LAST_DAY(NOW()), INTERVAL 1 DAY), INTERVAL - 1 MONTH) AND LAST_DAY(NOW()) ' +
			' GROUP BY tp.id ' +
			' ORDER BY points DESC' +
			' LIMIT '+limit,
			{
				type: QueryTypes.SELECT
			}
		);
	},

	/**
	 * Since creation ranks
	 *
	 * @param {int} limit
	 *
	 * @returns {Trophies[]}
	 */
	getTopSinceCreationHunters: async function (limit)
	{
		return await sequelize.query(
			' SELECT ' +
			'	tp.userId,' +
			'	tp.psnProfile,' +
			'	SUM(t.points) points,' +
			'	COUNT(t.id) num_trophies' +
			' FROM ' +
			' 	'+TrophyProfile.tableName+' tp ' +
			' 	INNER JOIN '+Trophies.tableName+' t ON t.trophyProfile = tp.id ' +
			' WHERE ' +
			'	t.completionDate > "2021-03-01" ' +
			' GROUP BY tp.id ' +
			' ORDER BY points DESC' +
			' LIMIT '+limit,
			{
				type: QueryTypes.SELECT
			}
		);
	},

	/**
	 * Lifetime ranks
	 *
	 * @param {int} limit
	 *
	 * @returns {Trophies[]}
	 */
	getTopLifetimeHunters: async function (limit)
	{
		return await sequelize.query(
			' SELECT ' +
			'	tp.userId,' +
			'	tp.psnProfile,' +
			'	SUM(t.points) points,' +
			'	COUNT(t.id) num_trophies' +
			' FROM ' +
			' 	'+TrophyProfile.tableName+' tp ' +
			' 	INNER JOIN '+Trophies.tableName+' t ON t.trophyProfile = tp.id ' +
			' GROUP BY tp.id ' +
			' ORDER BY points DESC' +
			' LIMIT '+limit,
			{
				type: QueryTypes.SELECT
			}
		);
	}
};
