'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class StockUrls extends Model {
	}

	StockUrls.init(
		{
			userId: DataTypes.STRING,
			url: DataTypes.STRING,
			is_validated: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'StockUrls',
			freezeTableName: true,
			tableName: 'stockurls',
		},
	);

	return StockUrls;
};
