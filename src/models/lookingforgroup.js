'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class LookingForGroup extends Model {

	}
	LookingForGroup.init({
		game: DataTypes.TEXT,
		description: DataTypes.TEXT,
		players: DataTypes.INTEGER,
		playAt: DataTypes.DATE,
		message_id: DataTypes.STRING,
		author_id: DataTypes.STRING,
	}, {
		sequelize,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		modelName: 'LookingForGroup',
	});
	return LookingForGroup;
};
