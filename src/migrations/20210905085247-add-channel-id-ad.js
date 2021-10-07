'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('ads', 'channel_id', { type: Sequelize.STRING });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('ads', 'channel_id');
	},
};
