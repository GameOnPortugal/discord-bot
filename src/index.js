const DotEnv = require('dotenv');
DotEnv.config();

const recursive = require('recursive-readdir');
const Discord = require('discord.js');
const { prefix } = require('./config/config.json');

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

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

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
