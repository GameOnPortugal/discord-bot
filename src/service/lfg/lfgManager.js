const models = require('./../../models');
const Lfg = models.LookingForGroup;

module.exports = {
	/**
   * Method to create an entry on LookingForGroups table, given the necessary data
   * and two callbacks
   * @param lfgData           data needed to create the row
   * @param onSuccess         on success callback routine
   * @param onFailure         on failure callback routine
   * @returns {Promise<Lfg>}
   */
	create: async function(lfgData, onSuccess, onFailure) {
		return Lfg
			.create(lfgData)
			.then(async () => {
				console.log('LFG request added with data: ', lfgData);
				onSuccess();
			})
			.catch(error => {
				console.log(`Error inserting LFG request, reason: ${error}, with data: `, lfgData);
				onFailure();
			});
	},
};