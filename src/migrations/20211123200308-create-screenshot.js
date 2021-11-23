'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('screenshots', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			channel_id: {
				allowNull: false,
				type: Sequelize.STRING,
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
			plataform: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			image: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			image_md5: {
				allowNull: false,
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
		await queryInterface.dropTable('screenshots');
	},
};
