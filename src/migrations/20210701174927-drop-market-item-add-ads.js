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
			message_id: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			author_id: {
				allowNull: false,
				type: Sequelize.STRING,
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
		}, {
			charset: 'utf8mb4',
			collate: 'utf8mb4_unicode_ci',
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Ads');

		await queryInterface.createTable('MarketItems', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
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
};
