'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('lfgevents', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			lfg_profile_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: {
					model: 'lfgprofile',
					key: 'id',
				},
			},
			lfg_game_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: {
					model: 'lfggames',
					key: 'id',
				},
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			points: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			detail: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			is_addressed: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			admin_note: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			report_user_id: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			admin_user_id: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('lfgevents');
	},
};
