module.exports = {
	name: 'ping',
	guildOnly: false,
	description: 'Ping!',
	execute(message) {
		// duplicated code for convenience
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

		message.channel.send('Pong.');
	},
};
