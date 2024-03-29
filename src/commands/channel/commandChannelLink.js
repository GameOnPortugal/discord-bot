const PermissionUtil = require('./../../util/permissionsUtil');
const CommandChannelLinkManager = require('./../../service/commandChannelLink/commandChannelLinkManager');

module.exports = {
	name: 'commandchannellink',
	description: 'Link command with a channel, so all content generated by it is diverted to that channel',
	guildOnly: true,
	args: true,
	usage: 'Associa um comando com um canal, todo o conteúdo criado por esse comando será postado nesse canal'
		+ '\n Command has the following structure: `!commandchannellink <command>`'
		+ '\n Examples:'
		+ '\n'
		+ '\n Use `!commandchannellink sell',
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
					message.channel.send('Missing association id. You can remove all associations by mentioning "all" in your delete command');

					return;
				}

				if (args[1] === 'all') {
					await CommandChannelLinkManager.deleteAll(message.channel.id);
					message.channel.send('All associations have been removed');

					return;
				}

				const affectedRows = await CommandChannelLinkManager.delete(message.channel.id, args[1]);
				if (!affectedRows) {
					message.channel.send('Associations did not exist for this channel.');

					return;
				}

				message.channel.send('Association "' + args[1] + '" has been removed!');

				return;
			}
			case 'info': {
				const commandChannelLinks = await CommandChannelLinkManager.findAll(message.channel.id);
				if (!commandChannelLinks || !commandChannelLinks.length) {
					message.channel.send('Channel does not have command associations!');

					return;
				}

				message.channel.send('Current channel command associations are:');
				for (const commandChannelLink of commandChannelLinks) {
					message.channel.send('[ID: ' + commandChannelLink.id + '] ' + commandChannelLink.command);
				}

				return;
			}
			default: {
				await CommandChannelLinkManager.create(
					{
						channelId: message.channel.id,
						command: args[0],
					},
				);

				message.channel.send('Command association has been created!');

				return;
			}
		}
	},
};
