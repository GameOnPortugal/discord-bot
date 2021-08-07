module.exports = {
	name: 'ping',
	guildOnly: false,
	description: 'Ping!',
	usage: 'Usado só para certificar que o bot está online e responsivo'
		+ '\n Exemplos:'
		+ '\n'
		+ '\n `|ping`',
	execute(message) {
		message.channel.send('Pong.');
	},
};
