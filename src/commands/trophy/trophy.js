const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const Discord = require('discord.js');
const TrophyProfileManager = require('./../../service/trophy/trophyProfileManager');
const PsnCrawlService = require('./../../service/trophy/psnCrawlService');
const TrophiesManager = require('./../../service/trophy/trophyManager');
const emojiEnum = require('./../../enum/discord/emojiEnum');

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');
const MessageMentions = require('./../../util/messageMention');

module.exports = {
	name: 'trophy',
	description: 'Claim a trophy',
	guildOnly: true,
	args: true,
	usage: 'Claim a trophy or show ranks'
		+ '\nExamples:'
		+ '\n'
		+ '\nUse `|trophy rank [monthly,lifetime,creation]` - top 5 jogadores de uma determinada categoria (default: monthly)'
		+ '\nUse `|trophy rank me` - mostra os teus ranks em todas as categorias'
		+ '\nUse `|trophy rank [discordUsername]` - mostra o rank de um determinado utilizador'
		+ '\nUse `|trophy rank monthly [MM,MM/YYYY]` - to show monthly rank for a specific month and year'
		+ '\nUse `|trophy https://psnprofiles/game/username`',
	async execute(message, args) {
		switch (args[0]) {
			case 'rank': {
				let type = Object.prototype.hasOwnProperty.call(args, 1) ? args[1] : 'monthly';
				let ranks = null;
				switch (type) {
					case 'me': {
						const userData = await TrophyProfileManager.findUserPosition(message.author);

						let hasRanks = false;
						let userDataMessage = 'Tu estás colocado nos seguintes ranks:\n';
						for (const rankData of userData.ranks) {
							if (rankData.position === 0) {
								continue;
							}
							hasRanks = true;
							userDataMessage += 'Rank ' + rankData.name + ' - ' + rankData.position + ' lugar (' + rankData.points + 'TP - ' + rankData.trophies + ' troféus)\n';
						}

						if (!hasRanks) {
							await message.channel.send('Infelizmente ainda nāo submeteste nenhum troféu.');

							return;
						}

						userDataMessage += '\n Parabéns tens ' + userData.totalPoints + 'TP nos ' + userData.totalTrophies + ' troféus que submeteste';

						await message.channel.send(userDataMessage);

						return;
					}
					case 'monthly': {
						let monthFilter = dayjs();
						if (Object.prototype.hasOwnProperty.call(args, 2)) {
							let filter = args[2];
							let format = 'MM';
							if (filter.length === 1) {
								// append a 0 to a single month
								filter = '0' + filter;
							}
							if (filter.length > 2) {
								format = 'MM/YYYY';
							}
							monthFilter = dayjs(filter, format);
							console.log(filter, monthFilter);
							if (!monthFilter.isValid()) {
								await message.channel.send('Data inválida, datas válidas: MM/YYYY ou MM ou M. Exemplo: 01/2021 ou 01 ou 1');

								return;
							}
						}
						type += ' ' + monthFilter.format('MM/YYYY');

						ranks = await TrophyProfileManager.getTopMonthlyHunters(5, monthFilter);
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
					default: {
						const mentionUser = await MessageMentions.getMessageMention(message.client, args[1]);
						if (!mentionUser) {
							message.channel.send('Utilizador ' + mentionUser.username + ' nāo encontrado... por favor volta a tentar mais tarde!');

							return;
						}

						const userData = await TrophyProfileManager.findUserPosition(mentionUser);

						let hasRanks = false;
						let userDataMessage = mentionUser.username + ' está colocado nos seguintes ranks:\n';
						for (const rankData of userData.ranks) {
							if (rankData.position === 0) {
								continue;
							}

							hasRanks = true;
							userDataMessage += 'Rank ' + rankData.name + ' - ' + rankData.position + ' lugar (' + rankData.points + 'TP - ' + rankData.trophies + ' troféus)\n';
						}

						if (!hasRanks) {
							await message.channel.send('Infelizmente ' + mentionUser.username + ' ainda nāo submeteu nenhum troféu.');

							return;
						}

						userDataMessage += '\n' + mentionUser.username + ' tem ' + userData.totalPoints + 'TP nos ' + userData.totalTrophies + ' troféus que submeteu.';

						await message.channel.send(userDataMessage);

						return;
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

					rankMessage += '`' + position + '.` <:' + emoji.name + ':' + emoji.id + '> ' + rank.psnProfile + ' (<@' + rank.userId + '>) com ' + rank.points + ' TP\n';
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

		// Attempt to grab PSN Ranks, if they are not available means that the account is probably banned!
		const profileRank = await PsnCrawlService.getProfileRank(psnProfileUsername);
		if (profileRank.worldRank === null || profileRank.countryRank === null) {
			await message.author.send(
				'Esta conta foi banida na PSN Profile!'
				+ '\nO teu troféu nāo foi aceite.'
				+ '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await TrophyProfileManager.flagAsBanned(trophyProfile);

			await message.delete();

			return;
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

			await MessageCreatorUtil.post(this, message, 'Parabéns <@' + message.author.id + '>! Acabaste de receber ' + trophy.points + ' TP (Trophy Points).');
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
