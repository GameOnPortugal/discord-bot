'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

	class TrophyProfile extends Model {
		static associate(models) {
			TrophyProfile.hasMany(models.Trophies, {
				foreignKey: 'trophyProfile',
			});
		}
	}

	TrophyProfile.init({
		userId: DataTypes.STRING,
		psnProfile: DataTypes.STRING,
		isBanned: DataTypes.BOOLEAN,
		hasLeft: DataTypes.BOOLEAN,
		isExcluded: DataTypes.BOOLEAN,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		modelName: 'TrophyProfile',
		freezeTableName: true,
		tableName: 'trophyprofiles',
	});

	return TrophyProfile;
};
