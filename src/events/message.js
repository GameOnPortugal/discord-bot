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

		// If prefix was not used AND/NOR bot was not mentioned
		if (!message.content.startsWith(prefix) && !message.mentions.has(client.user)) {
			// message isn't a command
			// validate message
			const isValid = await MessageValidator.validate(message);
			if (!isValid) {
				await message.author.send(
					'Your message was invalid and was automatically deleted.\n' +
                    '**If you think this was a mistake, please tell staff about it!**\n' +
                    'I\'m sending it over to you as you might want to add save a copy or post it in another channel.\n' +
                    'Your message was:\n\n',
				);
				await message.author.send(message.content);

				await message.delete();
			}

			return;
		}

		let args = message.content;
		if (message.content.startsWith(prefix)) {
			// remove the prefix from command and split arguments by spaces
			args = args.slice(prefix.length).trim().split(/ +/);
		}
		else {
			// split arguments by spaces
			args = args.trim().split(/ +/);
			// remove the bot name (e.g.: @PSPT-bot)
			args.shift();

			if (args.length === 0) {
				console.log('No commands sent');
				return;
			}
		}

		// Grab the command which is the second argument in the message
		const commandName = args.shift().toLowerCase();

		console.log('Command "' + commandName + '"', ' Arguments: ' + args);

		if (!client.commands.has(commandName)) return;

		try {
			const command = client.commands.get(commandName);
			if (command.guildOnly && message.channel.type === 'dm') {
				return message.reply('I can\'t execute that command inside DMs!');
			}
			if (command.args && !args.length) {
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
