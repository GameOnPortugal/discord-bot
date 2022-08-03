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

	getAllProfiles: async function() {
		const lfgProfiles = await LFGProfile.findAll();
		return lfgProfiles;
	},

	updateLfgPoints: async function() {
		const query = `
			SELECT GROUP_CONCAT(id) AS ids, lfg_profile_id, SUM(points) AS points
			FROM lfgevents
			WHERE is_addressed = 1 AND is_parsed = 0
			GROUP BY lfg_profile_id`;
		const lfgEvents = await models.sequelize.query(query, {
			type: models.sequelize.QueryTypes.SELECT,
		});

		// update points
		for (const lfgEvent of lfgEvents) {
			const lfgProfile = await LFGProfile.findOne({
				where: {
					id: lfgEvent.lfg_profile_id,
				},
			});
			lfgProfile.points = Number(lfgEvent.points) + Number(lfgProfile.points);
			await lfgProfile.save();
		}

		// update is_parsed
		const lfgEventIds = lfgEvents.map(lfgEvent => lfgEvent.ids);
		const lfgEventIdsString = lfgEventIds.join(',');
		if (lfgEventIdsString.length === 0) {
			return;
		}

		const query2 = `
			UPDATE lfgevents
			SET is_parsed = 1
			WHERE id IN (${lfgEventIdsString})`;
		await models.sequelize.query(query2, {
			type: models.sequelize.QueryTypes.UPDATE,
		});
	},
};