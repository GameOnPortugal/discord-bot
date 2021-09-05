'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Ads', 'channel_id', { type: Sequelize.STRING });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('Ads', 'channel_id');
	},
};
