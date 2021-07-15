'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Trophies', 'completionDate', { type: Sequelize.DATE });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('Trophies', 'completionDate');
	},
};
