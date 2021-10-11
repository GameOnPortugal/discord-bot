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

		// Command does not exist, nothing to do...
		if (!command) return;

		try {
			// Check whether or not the command can be ran through direct messaging.
			if (command.guildOnly && message.channel.type === 'dm') {
				return message.reply('I can\'t execute that command inside DMs!');
			}

			// Command require arguments and none were sent
			// Show the usage message
			if (command.args && !args.length) {
				const messageSent = await message.channel.send(command.usage);

				// Delete user message and bots message
				// Ignore any error that might happen because messages got deleted meanwhile
				setTimeout(async () => {
					// Check whether or not the message was already deleted by the user or by the command
					// if it was not then delete it
					const originalMessage = message.channel.messages.fetch(message.id);
					if (originalMessage) {
						try {
							await originalMessage.delete();
						}
						catch (e) {
							console.log(e);
						}
					}

					try {
						await messageSent.delete();
					}
					catch (e) {
						console.log(e);
					}
				}, 30000);

				return;
			}

			// Add help function to all commands which basically make them show the usage description
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
