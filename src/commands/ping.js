module.exports = {
	name: 'ping',
	guildOnly: false,
	description: 'Ping!',
	execute(message) {
		message.channel.send('Pong.');
	},
};
