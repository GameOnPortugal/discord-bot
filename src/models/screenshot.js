'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Screenshot extends Model {
	}

	Screenshot.init(
		{
			name: DataTypes.STRING,
			author_id: DataTypes.STRING,
			channel_id: DataTypes.STRING,
			message_id: DataTypes.STRING,
			plataform: DataTypes.STRING,
			image: DataTypes.STRING,
			image_md5: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Screenshot',
			freezeTableName: true,
			tableName: 'screenshots',
		},
	);

	return Screenshot;
};
