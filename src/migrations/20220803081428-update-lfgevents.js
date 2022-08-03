'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// add columns to lfgevents is_parsed and default to false
		await queryInterface.addColumn('lfgevents', 'is_parsed', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});

		// update all entries to is_parsed to false
		await queryInterface.sequelize.query(`
      UPDATE lfgevents
      SET is_parsed = false
    `);
	},

	down: async (queryInterface) => {
		// remove columns from lfgevents is_parsed
		await queryInterface.removeColumn('lfgevents', 'is_parsed');
	},
};
