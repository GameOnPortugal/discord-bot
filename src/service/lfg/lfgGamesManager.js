const models = require('../../models');
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
};