'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class MarketItem extends Model {
	}
	MarketItem.init({
		name: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'MarketItem',
	});
	return MarketItem;
};
