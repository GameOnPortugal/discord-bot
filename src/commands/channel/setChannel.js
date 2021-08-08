const models = require('./../../models');
const PermissionUtil = require('./../../util/permissionsUtil');

const SpecialChannel = models.SpecialChannel;

const allowedSpecialTypes = [
	'regex',
	'only_commands',
];

const MessageValidatorUtil = require('./../../util/MessageValidator');

/**
 * Remove cache for the channel
 *
 * @param message
 */
async function removeMessageValidatorCache(message) {
	await MessageValidatorUtil.cleanCache(message.channel.id);
}

module.exports = {
	name: 'setchannel',
	description: 'Configure channel with restrictions',
	guildOnly: true,
	args: true,
	usage: 'Configure channel to have some set of rules or conditions for messages to be allowed.\n' +
		'Command has the following structure: `!setchannel <type|info|delete|help> [optional_arguments]`\n\n' +
		'Examples:\n' +
		'Use `!setchannel regex ^/.+/$` for all messages to be accepted\n' +
		'Use `!setchannel regex ^/.?+game+.*/$` to enforce "game" keyword in the message\n' +
		'Use `!setchannel only_commands <command>[,command]` only allow commands (don\'t use prefix!)\n' +
		'Use `!setchannel only_commands sell,want` only allow sell and want commands\n' +
		'Use `!setchannel info` to grab current channel restrictions\n' +
		'Use `!setchannel delete <id>` to delete a channel restriction\n' +
		'Use `!setchannel delete all` to delete all channel restrictions\n' +
		'Use `!setchannel help` to grab this help message\n',
	async execute(message, args) {
		// Command only for admins and moderators
		if (
			!(await PermissionUtil.isAdmin(message.member))
			&& !(await PermissionUtil.isModerator(message.member))
		) {
			console.log('Member ' + message.author.username + ' is trying to use a command not for him!');

			return;
		}

		switch (args[0]) {
			case 'delete': {
				if (args.length < 2) {
					message.channel.send('Missing restriction id. You can remove all by mentioning "all" in your delete command');

					return;
				}

				await removeMessageValidatorCache(message);

				if (args[1] === 'all') {
					await SpecialChannel.destroy({ where: { channelId: message.channel.id } });
					message.channel.send('All restrictions have been removed');

					return;
				}

				const affectedRows = await SpecialChannel.destroy({ where: { channelId: message.channel.id, id: args[1] } });
				if (!affectedRows) {
					message.channel.send('Restriction did not exist for this channel.');

					return;
				}

				message.channel.send('Restriction "' + args[1] + '" has been removed');

				return;
			}
			case 'info': {
				const currentRestrictions = await SpecialChannel.findAll({ where: { channelId: message.channel.id } });
				if (!currentRestrictions.length) {
					message.channel.send('Channel does not have restrictions!');

					return;
				}

				message.channel.send('Current channel restrictions are:');
				for (const restriction of currentRestrictions) {
					message.channel.send('[ID: ' + restriction.id + '] ' + restriction.specialType + ' (' + (restriction.data ? restriction.data : '') + ')');
				}

				return;
			}
			default: {
				if (!allowedSpecialTypes.includes(args[0])) {
					message.channel.send('Special type "' + args[0] + '" not recognized! Valid options are:' + allowedSpecialTypes.join(','));

					return;
				}

				await SpecialChannel.create(
					{
						channelId: message.channel.id,
						specialType: args[0],
						data: args.length > 1 ? args[1] : null,
					},
				);

				message.channel.send('Special channel settings have been created!');

				await removeMessageValidatorCache(message);

				return;
			}
		}
	},
};
