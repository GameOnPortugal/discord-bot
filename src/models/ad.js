'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Ad extends Model {
	}

	Ad.init({
		name: DataTypes.STRING,
		author_id: DataTypes.STRING,
		message_id: DataTypes.STRING,
		state: DataTypes.STRING,
		price: DataTypes.STRING,
		zone: DataTypes.STRING,
		dispatch: DataTypes.STRING,
		warranty: DataTypes.STRING,
		description: DataTypes.TEXT,
		adType: DataTypes.STRING,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'Ad',
	});

	return Ad;
};
