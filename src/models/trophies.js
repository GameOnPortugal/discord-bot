'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

	class Trophies extends Model {
		static associate(models) {
			Trophies.belongsTo(models.TrophyProfile, {
				foreignKey: 'id',
			});
		}
	}

	Trophies.init({
		trophyProfile: DataTypes.INTEGER,
		url: DataTypes.TEXT,
		points: DataTypes.INTEGER,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	}, {
		sequelize,
		modelName: 'Trophies',
	});

	return Trophies;
};
