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
				type: Sequelize.STRING,
			},
			description: {
				type: Sequelize.STRING,
			},
			players: {
				type: Sequelize.INTEGER,
			},
			playAt: {
				type: Sequelize.DATE,
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
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('LookingForGroups');
	},
};