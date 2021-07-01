'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class MarketItem extends Model {
	}

	MarketItem.init({
		name: DataTypes.STRING,
		state: DataTypes.STRING,
		price: DataTypes.STRING,
		zone: DataTypes.STRING,
		dispatch: DataTypes.STRING,
		warranty: DataTypes.STRING,
		description: DataTypes.TEXT,
	}, {
		sequelize,
		modelName: 'MarketItem',
	});

	return MarketItem;
};
