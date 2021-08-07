const Discord = require('discord.js');
const TrophyProfileManager = require('./../../service/trophy/trophyProfileManager');
const PsnCrawlService = require('./../../service/trophy/psnCrawlService');
const TrophiesManager = require('./../../service/trophy/trophyManager');
const emojiEnum = require('./../../enum/discord/emojiEnum');

module.exports = {
	name: 'trophy',
	description: 'Claim a trophy',
	guildOnly: true,
	args: true,
	usage: 'Claim a trophy or show ranks'
        + '\nExamples:'
        + '\n'
		+ '\nUse `|trophy rank [monthly,lifetime,creation]` - to show ranks (defaults to monthly)'
        + '\nUse `|trophy https://psnprofiles/game/username`',
	async execute(message, args) {
		switch (args[0]) {
			case 'rank': {
				const type = Object.prototype.hasOwnProperty.call(args, 1) ? args[1] : 'monthly';
				let ranks = null;
				switch (type) {
					case 'monthly': {
						ranks = await TrophyProfileManager.getTopMonthlyHunters(5);
						break;
					}
					case 'creation': {
						ranks = await TrophyProfileManager.getTopSinceCreationHunters(5);
						break;
					}
					case 'lifetime': {
						ranks = await TrophyProfileManager.getTopLifetimeHunters(5);
						break;
					}
				}

				if (ranks === null) {
					message.channel.send('Rank do tipo "' + type + '" não reconhecido. Usa monthly, creation ou lifetime');
				}

				let rankMessage = '';
				let position = 1;
				const positionEmoji = {
					1: emojiEnum.TROPHY_PLAT,
					2: emojiEnum.TROPHY_GOLD,
					3: emojiEnum.TROPHY_SILVER,
				};
				for (const rank of ranks) {
					let emoji = Object.prototype.hasOwnProperty.call(positionEmoji, position) ? positionEmoji[position] : emojiEnum.TROPHY_BRONZE;
					emoji = await message.client.emojis.cache.get(emoji);

					rankMessage += '`' + position + '.` <:' + emoji.name + ':' + emoji.id + '> <@' + rank.userId + '> com ' + rank.points + ' TP\n';
					position++;
				}

				rankMessage = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Top ' + type)
					.setDescription(rankMessage)
					.setThumbnail('https://seeklogo.com/images/P/playstation-logo-A5B6E4856C-seeklogo.com.png')
					.setTimestamp()
					.setFooter('|trophy rank ' + type, 'https://seeklogo.com/images/P/playstation-logo-A5B6E4856C-seeklogo.com.png');

				message.channel.send(rankMessage);

				return;
			}
		}

		const trophyUrl = args[0];
		let psnProfileUsername = null;

		try {
			psnProfileUsername = TrophyProfileManager.getPsnProfileByUrl(trophyUrl);
		}
		catch (exception) {
			console.log(exception);

			await message.author.send(
				'URL inválido. Por favor volta a tentar.'
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		let trophyProfile = await TrophyProfileManager.findByPsnProfile(psnProfileUsername);

		if (!trophyProfile) {
			trophyProfile = await TrophyProfileManager.create(psnProfileUsername, message.author);
		}

		if (trophyProfile.userId !== message.author.id) {
			await message.author.send(
				'Esta conta já foi reclamada por outro utilizador no servidor.'
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		let trophy = await TrophiesManager.findByUsernameAndUrl(trophyProfile, trophyUrl);
		if (trophy) {
			await message.author.send(
				'Este trofeu já foi reclamado em ' + trophy.createdAt
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		try {
			const trophyData = await PsnCrawlService.getPlatTrophyData(trophyUrl);

			// Signal that trophy has been handled by bot
			await message.react(emojiEnum.TROPHY_PLAT);

			trophy = await TrophiesManager.create(trophyProfile, trophyUrl, trophyData);

			await message.channel.send('Parabéns <@' + message.author.id + '>! Acabaste de receber ' + trophy.points + ' TP (Trophy Points).');
		}
		catch (exception) {
			console.log('Problem creating trophy. Error: ' + exception.message);

			await message.author.send(
				'O bot encontrou o seguinte problema: ' + exception.message
				+ '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
				+ '\nSe isto for um erro do bot por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}
	},
};
