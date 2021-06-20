const DotEnv = require('dotenv');
DotEnv.config();

const recursive = require('recursive-readdir');
const Discord = require('discord.js');
const PrefixUtil = require('./util/prefixUtil');
const MessageValidator = require('./util/MessageValidator');

const client = new Discord.Client();
client.commands = new Discord.Collection();

recursive('./src/commands', function(err, commandFiles) {
	for (const file of commandFiles) {
		const command = require(process.cwd() + '/' + file);
		// set a new item in the Collection
		// with the key as the command name and the value as the exported module
		client.commands.set(command.name, command);
	}
});

/**
 * BOT has connected to the GUILD server and is ready!
 */
client.once('ready', () => {
	console.log('Ready!');
});

/**
 * BOT is handling messages on the GUILD
 */
client.on('message', async message => {
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
				'Your message was invalid and was automatically deleted.\n'+
				'**If you think this was a mistake, please tell staff about it!**\n'+
				'I\'m sending it over to you as you might want to add save a copy or post it in another channel.\n' +
				'Your message was:\n\n'
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
	const command = args.shift().toLowerCase();

	console.log('Command "' + command + '"', ' Arguments: ' + args);

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.BOT_TOKEN);
