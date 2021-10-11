'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('trophyprofiles', 'hasLeft', { type: Sequelize.BOOLEAN, defaultValue: false });
		await queryInterface.addColumn('trophyprofiles', 'isExcluded', { type: Sequelize.BOOLEAN, defaultValue: false });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('trophyprofiles', 'hasLeft');
		await queryInterface.removeColumn('trophyprofiles', 'isExcluded');
	},
};
