'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('lfgprofile', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			user_id: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			is_banned: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			banned_at: {
				type: Sequelize.DATE,
			},
			points: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
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

		await queryInterface.renameTable('lookingforgroups', 'lfggames');

		await queryInterface.bulkDelete('lfggames', null, {});

		await queryInterface.removeColumn('lfggames', 'author_id');

		await queryInterface.addColumn('lfggames', 'lfgProfile', {
			type: Sequelize.INTEGER,
			references: {
				model: 'lfgprofile',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		});

		await queryInterface.addColumn('lfggames', 'platform', {
			type: Sequelize.STRING,
			allowNull: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('lfggames', 'lfgProfile');
		await queryInterface.addColumn('lfggames', 'author_id', {
			type: Sequelize.STRING,
		});

		await queryInterface.removeColumn('lfggames', 'platform');

		await queryInterface.renameTable('lfggames', 'lookingforgroups');

		await queryInterface.dropTable('lfgprofile');
	},
};
