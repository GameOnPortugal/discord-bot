'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

	class TrophyProfile extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			TrophyProfile.hasMany(models.Trophies, {
				foreignKey: 'trophyProfile',
			});
		}
	}

	TrophyProfile.init({
		userId: DataTypes.STRING,
		psnProfile: DataTypes.STRING,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		modelName: 'TrophyProfile',
	});

	return TrophyProfile;
};
