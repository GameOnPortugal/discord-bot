const models = require('./../../models');
const LFGProfile = models.LFGProfile;

module.exports = {
	/**
     * Method to get a user's LFG profile by user id
     * @param userId           user id to get profile for
     * @returns {Promise<LFGProfile>}
     */
	getProfile: async function(userId) {
		const lfg = await LFGProfile.findOne({
			where: {
				user_id: userId,
			},
		});
		return lfg;
	},

	/**
    * Method to create LFG profile for a user, throws an error if the user already has one
    * @param userId           user id to create profile for
    * @returns {Promise<LFGProfile>}
    */
	createProfile: async function(userId) {
		if (await LFGProfile.findOne({ where: { user_id: userId } })) {
			throw new Error('User already has a LFG profile');
		}

		const lfgProfile = await LFGProfile.create({
			user_id: userId,
		});

		return lfgProfile;
	},

	handleGetOrCreateProfile: async function(userId) {
		const lfgProfile = await this.getProfile(userId);
		if (!lfgProfile) {
			return await this.createProfile(userId);
		}
		return lfgProfile;
	},

	getRankLifetime: async function() {
		// sort by points
		const lfgProfiles = await LFGProfile.findAll({
			order: [
				['points', 'DESC'],
			],
		});
		return lfgProfiles;
	},

};