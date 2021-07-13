const models = require('./../../models');
const TrophyProfile = models.TrophyProfile;

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
};
