const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const Discord = require('discord.js');
const TrophyProfileManager = require('./../../service/trophy/trophyProfileManager');
const PsnCrawlService = require('./../../service/trophy/psnCrawlService');
const emojiEnum = require('./../../enum/discord/emojiEnum');

const MessageMentions = require('./../../util/messageMention');

module.exports = {
	name: 'trophy',
	description: 'Claim a trophy',
	guildOnly: true,
	args: true,
	usage: 'Claim a trophy or show ranks'
		+ '\nExamples:'
		+ '\n'
		+ '\nUsa `|trophy rank [monthly,lifetime,creation]` - top 5 jogadores de uma determinada categoria (default: monthly)'
		+ '\nUsa `|trophy rank me` - mostra os teus ranks em todas as categorias'
		+ '\nUsa `|trophy rank [discordUsername]` - mostra o rank de um determinado utilizador'
		+ '\nUsa `|trophy rank monthly [MM,MM/YYYY]` - to show monthly rank for a specific month and year'
		+ '\nUsa `|trophy https://psnprofiles/username` - cria o teu perfil e mantém sincronizado'
		+ '\nUsa `|trophy check [username]` - verifica o estado da tua conta (ou do utilizador mencionado) e os teus rankings',
	async execute(message, args) {
		switch (args[0]) {
			case 'check': {
				const mentionUser = Object.prototype.hasOwnProperty.call(args, 1) ? await MessageMentions.getMessageMention(message.client, args[1]) : message.author;
				if (!mentionUser) {
					await message.reply('Utilizador nāo encontrado... por favor volta a tentar mais tarde!');

					return;
				}

				const trophyProfile = await TrophyProfileManager.findByDiscordUser(mentionUser);
				if (!trophyProfile) {
					await message.reply(mentionUser.username + ' ainda nāo tem uma conta de troféus!');

					return;
				}

				if (trophyProfile.isExcluded) {
					if (trophyProfile.isBanned) {
						await message.channel.send(
							'Oh oh. ' + trophyProfile.psnProfile + ' está banida no PSN Profile, como resultado nāo é considerado nos rankings do servidor!'
							+ ' Para resolver o assunto tenta contactar a PSN Profile e "esconde" os troféus inválidos.',
						);
					}
					else if (trophyProfile.hasLeft) {
						await message.channel.send('Oh oh. ' + trophyProfile.psnProfile + ' já nāo está neste servidor como resultado nāo é considerado nos rankings do servidor!');
					}

					return;
				}

				const profileRank = await PsnCrawlService.getProfileRank(trophyProfile.psnProfile);
				let profileCheckMessage = trophyProfile.psnProfile + ' é válida para os ranks do servidor!';
				profileCheckMessage += '\nhttps://psnprofile.com/' + trophyProfile.psnProfile + '\n';
				if (trophyProfile.isBanned) {
					profileCheckMessage += '\nInfelizmente a tua conta está banida na PSN Profile o que impossibilita-nos de obter os teus ranks mundiais e nacionais!';
					profileCheckMessage += '\nTenta contactar a PSN Profile para resolver o problema.';
				}
				else {
					profileCheckMessage += '\nRank Mundial:' + profileRank.worldRank + '\nRank Nacional:' + profileRank.countryRank;
				}

				await message.channel.send(profileCheckMessage);

				return;
			}
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

			return;
		}

		let trophyProfile = await TrophyProfileManager.findByPsnProfile(psnProfileUsername);

		if (!trophyProfile) {
			trophyProfile = await TrophyProfileManager.create(psnProfileUsername, message.author);
			await message.author.send('Parabéns a tua conta no discord foi linkada com ' + psnProfileUsername + '! Se isto foi em erro por favor avisa alguém da equipa.');
		}
	},
};
