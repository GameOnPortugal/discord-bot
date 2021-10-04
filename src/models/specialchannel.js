'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class SpecialChannel extends Model {
	}

	SpecialChannel.init(
		{
			channelId: DataTypes.STRING,
			specialType: DataTypes.STRING,
			data: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: 'SpecialChannel',
			freezeTableName: true,
			tableName: 'specialchannels',
		},
	);

	return SpecialChannel;
};
