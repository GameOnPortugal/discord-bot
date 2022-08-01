'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class LFGParticipation extends Model {
		static associate(models) {
			LFGParticipation.belongsTo(models.LFGGame, {
				foreignKey: 'lfg_game_id',
				onDelete: 'CASCADE',
				as: 'lfgGame',
			});
			LFGParticipation.belongsTo(models.LFGProfile, {
				foreignKey: 'lfg_profile_id',
				as: 'lfgProfile',
				onDelete: 'CASCADE',
			});
		}
	}

	LFGParticipation.init({
		lfg_game_id: DataTypes.INTEGER,
		lfg_profile_id: DataTypes.INTEGER,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'LFGParticipation',
		freezeTableName: true,
		tableName: 'lfgparticipations',
	});

	return LFGParticipation;
};