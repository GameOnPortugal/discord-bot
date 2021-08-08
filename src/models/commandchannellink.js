'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class CommandChannelLink extends Model {

	}
	CommandChannelLink.init({
		command: DataTypes.STRING,
		channelId: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'CommandChannelLink',
	});
	return CommandChannelLink;
};
