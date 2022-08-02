const models = require('../../models');
const lfgEventManager = require('./lfgEventManager');
const LFGGame = models.LFGGame;

module.exports = {
	/**
	 * Method to Crate a new LFGGame
	 * @param {Object} lfgGameData
	 */
	create: async function(lfgData) {
		return LFGGame.create(lfgData);
	},

	getGameById: async function(gameId) {
		return LFGGame.findOne({
			where: {
				id: gameId,
			},
		});
	},

	/**
	 * Method to update message id after the message is created
	 * @param id              id of the row to update
	 * @param messageId       message id to update
	 * @returns {Promise<LFGGame>}
	 */
	updateMessageId: async function(id, messageId) {
		return LFGGame.update({ message_id: messageId }, { where: { id } });
	},

	/**
	 * Method to get profile from LFGGame
	 * @returns {Promise<LFGProfile>}
	 */
	getLfgProfile: async function(lfgGame) {
		return await models.LFGProfile.findOne({ where: { id: lfgGame.lfgProfile } });
	},

	/**
	 * Adds participation to the game
	 */
	addParticipation: async function(lfgGame, lfgProfile) {
		const newParticipation = {
			lfg_game_id: lfgGame.id,
			lfg_profile_id: lfgProfile.id,
		};

		try {
			const participation = await models.LFGParticipation.create(
				newParticipation,
			);
			lfgEventManager.participateEvent(lfgProfile, lfgGame);
			return participation;
		}
		catch (err) {
			console.log('Error adding participation: ' + err.message);
		}
	},

	/**
	 * remove participation from lfgGame
	 */
	removeParticipation: async function(lfgGame, lfgProfile) {
		const participation = await models.LFGParticipation.findOne({
			where: {
				lfg_game_id: lfgGame.id,
				lfg_profile_id: lfgProfile.id,
			},
		});

		if (participation) {
			lfgEventManager.leaveEvent(lfgProfile, lfgGame);
			return participation.destroy();
		}
	},

	/**
	 * Get Participants
	 */
	getParticipants: async function(lfgGame) {
		return await models.LFGParticipation.findAll({
			where: {
				lfg_game_id: lfgGame.id,
			},
			include: ['lfgGame', 'lfgProfile'],
		});
	},
};
