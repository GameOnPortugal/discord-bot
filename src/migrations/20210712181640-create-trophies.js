'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('trophies', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			trophyProfile: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: {
						tableName: 'trophyprofiles',
					},
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			url: {
				type: Sequelize.TEXT,
			},
			points: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable('trophies');
	},
};
