'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('trophyprofiles', 'isBanned', { type: Sequelize.BOOLEAN, defaultValue: false });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('trophyprofiles', 'isBanned');
	},
};
