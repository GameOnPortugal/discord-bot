'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Ad extends Model {
	}

	Ad.init({
		name: DataTypes.STRING,
		state: DataTypes.STRING,
		price: DataTypes.STRING,
		zone: DataTypes.STRING,
		dispatch: DataTypes.STRING,
		warranty: DataTypes.STRING,
		description: DataTypes.TEXT,
		adType: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'Ad',
	});

	return Ad;
};
