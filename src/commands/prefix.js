const PrefixUtil = require('../util/prefixUtil');

module.exports = {
	name: 'prefix',
	guildOnly: false,
	description: 'Define prefix for bot',
	async execute(message, args) {
		if (args.length === 0) {
			const prefix = await PrefixUtil.getPrefix();

			message.channel.send('Current prefix is ' + prefix);

			return;
		}

		if (args.length === 1) {
			await PrefixUtil
				.setPrefix(args[0])
				.catch(function() {
					message.channel.send('Fail to set prefix');
				});

			message.channel.send('Prefix set to ' + args[0]);

			return;
		}

		message.channel.send('Invalid command. Please use: @mentionBot prefix [set_new_prefix]');
	},
};
