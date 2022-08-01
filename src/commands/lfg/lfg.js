const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const Discord = require('discord.js');
const LfgGamesManager = require('../../service/lfg/lfgGamesManager');
const LfgProfileManager = require('./../../service/lfg/lfgProfileManager');
const LfgEventManager = require('./../../service/lfg/lfgEventManager');

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');
const PermissionsUtil = require('../../util/permissionsUtil');

const questions = {
	game: {
		question: 'Qual é o nome do jogo? Ex: "Destiny 2"',
		validator: /^.*$/,
	},
	platform: {
		question: 'Qual é a plataforma? Ex: "PC", "PS4", "XBOX"',
		validator: /^.*$/,
	},
	description: {
		question:
      'Adiciona uma descrição ao teu pedido! Ex: "Cross play possivel", "Raid completa ou checkpoint X", "Noob-friendly"',
		validator: /^.*$/,
	},
	players: {
		question: 'Tamanho do grupo?',
		validator: /^[1-9][0-9]*$/,
	},
	playAt: {
		question:
      'Quando está prevista a sessão de jogo (DD-MM-YYYY HH:MM ou HH:MM)? ex: "30-07-2021 08:03", "23:50"',
		validator: /^(?:\d{2}-\d{2}-\d{4} )*\d{2}:\d{2}$/,
	},
};

async function handleReact(message, user, emoji, lfgGame) {
	console.log('React from:', user, 'with emoji:', emoji);

	const lfgProfile = await LfgProfileManager.handleGetOrCreateProfile(user.id);
	const userReactions = message.reactions.cache.filter((reaction) =>
		reaction.users.cache.has(user.id),
	);
	if (lfgProfile.is_banned) {
		// send message to user saying they are banned from LFG
		return user.createDM().then((dm) => {
			for (const reaction of userReactions.values()) {
				reaction.users.remove(user.id);
			}
			dm.send(
				'Foste banido do LFG, e por isso não podes reagir a posts!\n' +
          'Para mais informações, entre em contato com o administrador do servidor.',
			);
		});
	}
	if (emoji === '👍') {
		// add participation
		const participation = await LfgGamesManager.addParticipation(
			lfgGame,
			lfgProfile,
		);
		console.log('Added participation:', participation);
	}
	else {
		// remove participation
		const participation = await LfgGamesManager.removeParticipation(
			lfgGame,
			lfgProfile,
		);
		console.log('Removed participation:', participation);
	}

	try {
		console.log('Reactions:', userReactions.values());
		for (const reaction of userReactions.values()) {
			if (reaction.emoji.name === emoji) continue;
			await reaction.users.remove(user.id);
		}
	}
	catch (error) {
		console.error('Failed to remove reactions.');
	}
}

async function updateEmbed(original, lfgProfile, lfgGame) {
	const participating = await LfgGamesManager.getParticipants(lfgGame);

	console.log('Participating:', participating);

	const editedLfgMessage = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Procura de Grupo')
		.setDescription(lfgGame.description)
		.addField('Jogo', lfgGame.game, false)
		.addField('Plataforma', lfgGame.platform, true)
		.addField('Autor', `<@${lfgProfile.user_id}>`, true)
		.addField('Jogadores', `${participating.length}/${lfgGame.players}`, true)
		.addField(
			'Hora/Data Prevista',
			dayjs(lfgGame.playAt).format('YYYY-MM-DD HH:mm'),
			true,
		);

	const playerIds = participating.map(
		(participant) => `<@${participant.lfgProfile.user_id}>`,
	);

	if (participating.length !== 0) {
		editedLfgMessage.addField('Aceite', playerIds.join(' '));
	}

	editedLfgMessage
		.addField('\u200B', 'Reage com :thumbsup: para te juntares!')
		.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
		.setTimestamp()
		.setFooter('|lfg create', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

	original.edit(editedLfgMessage);
	console.log('Edited embed');
}

module.exports = {
	name: 'lfg',
	guildOnly: true,
	args: true,
	description: 'Find a group of players for a gaming session',
	usage: 'Inicia um pedido de procura de grupo!' +
	'\n `|lfg create`' +
	'\n `|lfg miss <game_id> <@user> <Details>`',
	async execute(message, args) {
		if (process.env.NODE_ENV !== 'development') {
			// send message to channel to let the user know that the command is not available
			message.reply('Este comando não está disponível no momento.');
			return;
		}

		switch (args[0]) {
			case 'create': {
				const userId = message.author.id;
				const lfgProfile = await LfgProfileManager.handleGetOrCreateProfile(
					userId,
				);
				if (lfgProfile.is_banned) {
					// send message to user saying they are banned from LFG
					return message.author.createDM().then((dm) => {
						dm.send(
							'Foste banido do LFG.\n' +
                'Para mais informações, entre em contato com o administrador do servidor.',
						);
					});
				}

				console.log('LFG Profile:', lfgProfile);
				const data = { lfgProfile: lfgProfile.id };
				const now = dayjs();
				let validAnswer = false;
				let hasAnswered = false;

				// deleting the original request this should be uncommented on production
				// message.delete();
				await message.author.createDM().then(async (dmchannel) => {
					await dmchannel.send(
						'Vamos criar um Looking for Group! Apenas tens 30 seg. entre perguntas para responder. No final, o post será criado por ti.',
					);

					for (const questionName in questions) {
						do {
							validAnswer = false;
							hasAnswered = false;
							await dmchannel.send(questions[questionName].question);

							await dmchannel
								.awaitMessages(
									(m) => m.author.id === message.author.id && m.content,
									{
										max: 1,
										time: 30000,
										errors: ['time'],
									},
								)
								.then(async (collected) => {
									hasAnswered = true;
									let answer = collected.last().content;

									if (!questions[questionName].validator.test(answer)) {
										await dmchannel.send(
											'A tua mensagem não foi aceite, por favor tenta de novo.',
										);

										return;
									}

									// Additional validations for date
									if (questionName === 'playAt') {
										let format = 'HH:mm';
										if (answer.trim().length > 5) {
											format = 'DD-MM-YYYY HH:mm';
										}

										const playAt = dayjs(answer, format);

										if (!playAt.isValid()) {
											await dmchannel.send(
												'Data inválida! Apenas datas como "20-03-2021 18:30" ou apenas horas "20:00" são aceites.',
											);

											return;
										}
										if (playAt.isSameOrBefore(now)) {
											await dmchannel.send(
												'Data inválida! Apenas datas no futuro.',
											);

											return;
										}

										answer = playAt;
									}

									validAnswer = true;
									data[questionName] = answer;
								})
								.catch(async (error) => {
									if (!hasAnswered) {
										await dmchannel.send('Acabou o tempo... post cancelado.');
									}
									else if (error) {
										console.error(error);

										await dmchannel.send('Error: ' + error);
									}
								});
						} while (!validAnswer && hasAnswered);

						if (!validAnswer || !hasAnswered) {
							console.log('Not all questions were answered or they were valid');

							return;
						}
					}

					// after information gathering
					console.log('gathered information: ', data);

					const lfgMessage = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('Procura de Grupo')
						.setDescription(data.description)
						.addField('Jogo', data.game, false)
						.addField('Plataforma', data.platform, true)
						.addField('Autor', `<@${lfgProfile.user_id}>`, true)
						.addField('Jogadores', `0/${data.players}`, true)
						.addField(
							'Hora/Data Prevista',
							data.playAt.format('YYYY-MM-DD HH:mm'),
							true,
						)
						.addField('\u200B', 'Reage com :thumbsup: para te juntares!')
						.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
						.setTimestamp()
						.setFooter(
							'|lfg create',
							'https://i.ibb.co/LzHsvdn/Transparent-2.png',
						);

					await dmchannel.send(lfgMessage);
					await dmchannel.send(
						'Aqui está um preview do teu pedido. Queres colocá-lo no canal? [sim/não]',
					);

					let createItem = false;
					await dmchannel
						.awaitMessages((m) => m.author.id === message.author.id, {
							max: 1,
							time: 30000,
							errors: ['time'],
						})
						.then(async (collected) => {
							const answer = collected.last().content.toLowerCase().trim();
							if (answer === 'sim' || answer === 's') {
								createItem = true;
							}
						})
						.catch(async () => {
							await dmchannel.send('Time up.. no LFG will be created.');
						});

					if (createItem) {
						console.log(
							'LFG approved. Creating the item on the db and sending it to the channel!',
						);

						const lfgGame = await LfgGamesManager.create(data);
						if (!lfgGame) {
							await dmchannel.send(
								'Ocorreu um erro ao criar o pedido, tenta de novo dentro de momentos',
							);
							return;
						}

						LfgEventManager.createGameEvent(lfgProfile, lfgGame);

						const newMessage = await MessageCreatorUtil.post(
							this,
							message.channel,
							lfgMessage,
						);
						data['message_id'] = newMessage.id;

						// insert reactions
						await newMessage.react('👍');
						await newMessage.react('❌');

						// wait for reactions
						const filter = (reaction) => {
							return ['👍', '❌'].includes(reaction.emoji.name);
						};

						LfgGamesManager.updateMessageId(lfgGame.id, newMessage.id);

						const collector = newMessage.createReactionCollector(filter, {
							time: data['playAt'].diff(now),
						});

						collector.on('collect', async (reaction, _user) => {
							await handleReact(
								newMessage,
								_user,
								reaction.emoji.name,
								lfgGame,
							);
							await updateEmbed(newMessage, lfgProfile, lfgGame);
						});

						await dmchannel.send(
							'O teu pedido foi criado com sucesso. Obrigado!',
						);
					}
					else {
						console.log('LFG cancelled. Nothing to see here.');
					}
				});
				return;
			}
			case 'miss': {
				if (args.length < 4) {
					message.reply('Comando inválido. Use `lfg miss <game_id> <@user> <details>`');
					return;
				}

				const gameId = args[1];
				const targetUser = await LfgProfileManager.getProfile(message.mentions.users.first().id);
				const details = args.slice(3).join(' ');
				const user = await LfgProfileManager.getProfile(message.author.id);

				const options = {
					isAdmin: false,
					hasLfgProfile: true,
				};

				if (!user) {
					message.reply('Não tens um perfil LFG. Cria um pedido LFG ou entra num já existente!');
					if (!PermissionsUtil.isAdmin(message.member)) {
						message.reply('... E não tens permissão para fazer isso!');
						return;
					}
					options.hasLfgProfile = false;
					options.isAdmin = true;
				}

				if (!targetUser) {
					message.reply(`Não consegui encontrar o utilizador <@${targetUser.user_id}>`);
					return;
				}

				const lfgGame = await LfgGamesManager.getGameById(gameId);
				if (!lfgGame) {
					message.reply('Não consegui encontrar o LFG Game.');
					return;
				}

				// game has to be at least 5 min in
				const playAt = dayjs(lfgGame.playAt);

				if (playAt.diff('minutes') < 5) {
					message.reply('Só podes reportar a falta se o jogo tiver começado há pelo menos 5 minutos.');
					return;
				}

				const participants = await LfgGamesManager.getParticipants(lfgGame);
				const participantsIds = participants.map((p) => p.lfgProfile.id);
				if (!participantsIds.includes(targetUser.id)) {
					message.reply('Este utilizador não está no jogo.');
					return;
				}

				const miss = await LfgEventManager.missEvent(message.author.id, targetUser, lfgGame, details, options);
				if (!miss) {
					message.reply('Ocorreu um erro ao reportar a falta ou já foi reportada anteriormente.');
					return;
				}
				message.reply('Falta reportada com sucesso. Obrigado.');

				return;
			}
			case 'report': {
				let i = 1;
				let game = null;
				const options = {
					isAdmin: false,
					hasLfgProfile: true,
					hasLfgGame: false,
				};

				if (args.length < 3) {
					message.reply('Comando inválido. Use `lfg report [<game_id>] <@user> <details>`');
					return;
				}

				if (Number.isInteger(Number(args[i++]))) {
					const gameId = args[1];
					game = await LfgGamesManager.getGameById(gameId);
					if (!game) {
						message.reply('Não consegui encontrar o LFG Game.');
						return;
					}
					options.hasLfgGame = true;
				}

				const user = await LfgProfileManager.getProfile(message.author.id);
				const details = args.slice(i + 1).join(' ');

				if (!user) {
					message.reply('Não tens um perfil LFG. Cria um pedido LFG ou entra num já existente!');
					if (!PermissionsUtil.isAdmin(message.member)) {
						message.reply('... E não tens permissão para fazer isso!');
						return;
					}
					options.hasLfgProfile = false;
					options.isAdmin = true;
				}

				const reportedUser = await LfgProfileManager.getProfile(message.mentions.users.first().id);
				if (!reportedUser) {
					message.reply(`Não consegui encontrar o utilizador <@${reportedUser.user_id}>`);
					return;
				}

				const reportEvent = await LfgEventManager.reportEvent(
					message.author.id,
					reportedUser,
					game,
					details,
					options,
				);
				if (!reportEvent) {
					message.reply('Ocorreu um erro ao reportar o utilizador.');
					return;
				}
				message.reply('Utilizador reportado com sucesso. Obrigado.');

				// enviar mensagem para canal ID: 1003663012256825484
				const channel = message.client.channels.cache.get(message.channel.id);
				if (channel) {
					channel.send(`<@${message.author.id}> reportou <@${reportedUser.user_id}>` +
					`${game ? ` no jogo **${game.game}**(${game.id})` : ''}` +
					`${details ? `:\n ${details}` : ''}`);
				}

				return;
			}
		}
		await message.reply(
			'Comando inválido. Usa `|lfg help` para saber como usar este comando!',
		);
	},
};
