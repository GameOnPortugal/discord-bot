const models = require('../../models');
const lfgEventManager = require('./lfgEventManager');
const LFGGame = models.LFGGame;

module.exports = {
	/**
   * Method to create an entry on LookingForGroups table, given the necessary data
   * and two callbacks
   * @param lfgData           data needed to create the row
   * @returns {Promise<LFGGame>}
   */
	create: async function(lfgData) {
		return LFGGame.create(lfgData);
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
     * Adds participation to the game
     */
	addParticipation: async function(lfgGame, lfgProfile) {
		const newParticipation = {
			lfg_game_id: lfgGame.id,
			lfg_profile_id: lfgProfile.id,
		};

		try {
			const participation = await models.LFGParticipation.create(newParticipation);
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

	/**
     * Get Game by Id
     */
	getGameById: async function(id) {
		return await LFGGame.findOne({
			where: {
				id,
			},
		});
	},
};