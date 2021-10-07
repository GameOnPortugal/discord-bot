'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('trophies', 'completionDate', { type: Sequelize.DATE });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('trophies', 'completionDate');
	},
};
