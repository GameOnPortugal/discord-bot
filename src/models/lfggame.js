'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class LFGGame extends Model {
		static associate(models) {
			LFGGame.belongsTo(models.LFGProfile, {
				foreignKey: 'lfgProfile',
				as: 'profile',
			});
			LFGGame.hasMany(models.LFGParticipation, {
				foreignKey: 'lfg_game_id',
				as: 'participants',
			});
		}
	}
	LFGGame.init({
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		game: DataTypes.TEXT,
		description: DataTypes.TEXT,
		players: DataTypes.INTEGER,
		playAt: DataTypes.DATE,
		message_id: DataTypes.STRING,
		platform: DataTypes.STRING,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'LFGGame',
		freezeTableName: true,
		tableName: 'lfggames',
	});
	return LFGGame;
};
