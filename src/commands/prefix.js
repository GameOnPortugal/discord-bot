const PrefixUtil = require('../util/prefixUtil');

module.exports = {
	name: 'prefix',
	guildOnly: false,
	description: 'Define prefix for bot',
	async execute(message, args) {
		let botMention = message.content.trim().split(' ')[0];
		if (botMention.startsWith('<@') && botMention.endsWith('>')) {
			botMention = botMention.slice(2, -1);

			if (botMention.startsWith('!')) {
				botMention = botMention.slice(1);
			}
		}

		if (botMention !== message.client.user.id) {
			console.log('This bot is not the target!');
			return;
		}

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
