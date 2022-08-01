'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class LFGProfile extends Model {
		static associate(models) {
			LFGProfile.hasMany(models.LFGGame, {
				foreignKey: 'lfgProfile',
			});
		}
	}
	LFGProfile.init({
		user_id: DataTypes.STRING,
		is_banned: DataTypes.BOOLEAN,
		banned_at: DataTypes.DATE,
		points: DataTypes.INTEGER,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'LFGProfile',
		freezeTableName: true,
		tableName: 'lfgprofile',
	});
	return LFGProfile;
};
