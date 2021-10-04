const DotEnv = require('dotenv');
DotEnv.config();

const recursive = require('recursive-readdir');
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// SENTRY
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
	op: "client.index",
	name: "Bot is logged and listening",
});

setTimeout(() => {
	try {
		recursive('./src/commands', function(err, commandFiles) {
			for (const file of commandFiles) {
				const command = require(process.cwd() + '/' + file);
				// set a new item in the Collection
				// with the key as the command name and the value as the exported module
				client.commands.set(command.name, command);
			}
		});

		const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
		for (const file of eventFiles) {
			const event = require(`./events/${file}`);
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			}
			else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}

		client.login(process.env.BOT_TOKEN);
	} catch (e) {
		Sentry.captureException(e);
	} finally {
		transaction.finish();
	}
}, 99);

