'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('LookingForGroups', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			game: {
				type: Sequelize.TEXT,
			},
			description: {
				type: Sequelize.TEXT,
			},
			players: {
				type: Sequelize.INTEGER,
			},
			playAt: {
				type: Sequelize.STRING,
			},
			message_id: {
				type: Sequelize.STRING,
			},
			author_id: {
				type: Sequelize.STRING,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		}, {
			charset: 'utf8mb4',
			collate: 'utf8mb4_unicode_ci',
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('LookingForGroups');
	},
};