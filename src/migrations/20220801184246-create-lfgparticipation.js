'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('lfgparticipations', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			lfg_game_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'lfggames',
					key: 'id',
				},
			},
			lfg_profile_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: {
					model: 'lfgprofile',
					key: 'id',
				},
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		queryInterface.addConstraint('lfgparticipations', {
			fields: ['lfg_game_id', 'lfg_profile_id'],
			type: 'unique',
			name: 'unique_lfg_game_id_lfg_profile_id',
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('lfgparticipations');
	},
};
