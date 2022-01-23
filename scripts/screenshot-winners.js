// Attempt to grab PSN Ranks, if they are not available means that the account is probably banned!
const ScreenshotManager = require('./../src/service/screenshot/screenshotManager');
const Discord = require('discord.js');
const client = new Discord.Client();
const emojiEnum = require('./../src/enum/discord/emojiEnum');
const dayjs = require('dayjs');

(async () => {
	await client.login(process.env.BOT_TOKEN);

	const channel = await client.channels.fetch('827646847483904040');
	if (!channel) {
		console.log('Could not find channel');
		process.exit(1);
		return;
	}

	const screenshots = await ScreenshotManager.findAllScreenshotsForThisWeek();
	console.log('Found ' + screenshots.length + ' screenshots for this week');

	let winner = null;
	for (const screenshot of screenshots) {
		console.log('Checking votes for ' + screenshot.name);

		const message = await channel.messages.fetch(screenshot.message_id);
		if (!message) {
			console.error('Message not found');
			continue;
		}

		const reactions = await message.reactions.cache.filter(reaction => reaction.emoji.id === emojiEnum.TROPHY_PLAT);
		const reaction = reactions.first();
		if (!reaction) {
			console.error('Reaction not found');
			continue;
		}

		console.log('Reaction count: ' + reaction.count);
		if (winner === null || reaction.count > winner.reactionCount) {
			winner = {
				reactionCount: reaction.count,
				message: message,
				screenshot: screenshot,
			};
		}
	}
	if (!winner) {
		console.log('No winner found');
		process.exit(1);
	}
	else {
		console.log('Screenshots processed. Winner is ' + winner.screenshot.name);
		const winnerMessage = 'Parabéns <@' + winner.screenshot.author_id + '> ganhaste o screenshot da semana com '
            + winner.screenshot.name + '. Plataforma: ' + winner.screenshot.plataform
            + '.\n\n' + winner.message.url;

		await channel.send(winnerMessage);
		await channel.send('!give-xp <@' + winner.screenshot.author_id + '> 1000');

		const tomorrow = dayjs().add(1, 'day');
		await channel.send('========= Concurso ' + tomorrow.format('DD/MM') + ' ABERTO ===========');

		process.exit(0);
	}
})();

