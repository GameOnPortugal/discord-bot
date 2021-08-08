const PrefixUtil = require('./../util/prefixUtil');
const MessageValidator = require('./../util/MessageValidator');

module.exports = {
	name: 'message',
	async execute(message, client) {
		const prefix = await PrefixUtil.getPrefix();

		if (message.author.bot) {
			// Ignore bots
			return;
		}

		// message isn't a command
		// validate message
		const isValid = await MessageValidator.validate(message);
		if (!isValid) {
			await message.author.send(
				'A tua mensagem foi considerada invalida conforme as regras do canal'
				+ '\nVerifica as condições no tópico do canal ou nas mensagens afixadas'
				+ '\nSe achas que isto é um erro por favor envia mensagem privada para o ModMail'
				+ '\n\nEsta foi a tua mensagem:',
			);
			await message.author.send(message.content);
			await message.delete();

			return;
		}

		if (!message.content.startsWith(prefix)) {
			// Command prefix not used, no command?
			return;
		}

		// remove the prefix from command and split arguments by spaces
		const args = message.content.slice(prefix.length).trim().split(/ +/);

		// Grab the command which is the second argument in the message
		const commandName = args.shift().toLowerCase();

		console.log('Command "' + commandName + '"', ' Arguments: ' + args);

		const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return;

		try {
			if (command.guildOnly && message.channel.type === 'dm') {
				return message.reply('I can\'t execute that command inside DMs!');
			}
			if (command.args && !args.length) {
				return message.channel.send(command.usage);
			}
			const isHelp = Object.prototype.hasOwnProperty.call(args, 0) ? args[0] === 'help' : false;
			if (isHelp) {
				return message.channel.send(command.usage);
			}

			command.execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	},
};
