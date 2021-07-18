const models = require('./../../models');
const Lfg = models.LookingForGroup;

module.exports = {
	/**
   * Method to create an entry on LookingForGroups table, given the necessary data
   * and two callbacks
   * @param lfgData           data needed to create the row
   * @returns {Promise<Lfg>}
   */
	create: async function(lfgData) {
		return Lfg.create(lfgData);
	},
};