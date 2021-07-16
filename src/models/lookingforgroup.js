'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class LookingForGroup extends Model {

	}
	LookingForGroup.init({
		game: DataTypes.STRING,
		description: DataTypes.STRING,
		players: DataTypes.INTEGER,
		playAt: DataTypes.STRING,
		message_id: DataTypes.STRING,
		author_id: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'LookingForGroup',
	});
	return LookingForGroup;
};