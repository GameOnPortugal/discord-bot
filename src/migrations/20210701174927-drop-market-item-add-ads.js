'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Drop old table
		await queryInterface.dropTable('MarketItems');

		// Create a new one
		await queryInterface.createTable('Ads', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			state: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			price: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			zone: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			dispatch: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			warranty: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			description: {
				allowNull: true,
				type: Sequelize.TEXT,
			},
			adType: {
				allowNull: false,
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable('Ads');
	},
};
