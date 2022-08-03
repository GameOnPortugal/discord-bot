'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class LFGEvent extends Model {
		static associate(models) {
			LFGEvent.belongsTo(models.LFGProfile, {
				foreignKey: 'lfg_profile_id',
				as: 'lfgProfile',
			});

			LFGEvent.belongsTo(models.LFGGame, {
				foreignKey: 'lfg_game_id',
				as: 'game',
			});
		}
	}

	LFGEvent.init({
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		type: DataTypes.STRING,
		points: DataTypes.INTEGER,
		detail: DataTypes.TEXT,
		is_addressed: DataTypes.BOOLEAN,
		admin_note: DataTypes.TEXT,
		report_user_id: DataTypes.TEXT,
		admin_user_id: DataTypes.TEXT,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'LFGEvent',
		freezeTableName: true,
		tableName: 'lfgevents',
	});

	return LFGEvent;
};