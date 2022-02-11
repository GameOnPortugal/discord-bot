const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const Discord = require('discord.js');
const LfgManager = require('./../../service/lfg/lfgManager');

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');

const questions = {
	game: {
		question: 'Qual é o nome do jogo? Ex: "Destiny 2"',
		validator: /^.*$/,
	},
	description: {
		question: 'Adiciona uma descrição ao teu pedido! Ex: "Cross play possivel", "Raid completa ou checkpoint X", "Noob-friendly"',
		validator: /^.*$/,
	},
	players: {
		question: 'Tamanho do grupo?',
		validator: /^[1-9][0-9]*$/,
	},
	playAt: {
		question: 'Quando está prevista a sessão de jogo (DD-MM-YYYY HH:MM ou HH:MM)? ex: "30-07-2021 08:03", "23:50"',
		validator: /^(?:\d{2}-\d{2}-\d{4} )*\d{2}:\d{2}$/,
	},
};

async function handleReact(message, user, emoji) {
	console.log('React from:', user, 'with emoji:', emoji);

	const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
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

function updateEmbed(original, data) {
	const players = [];

	original.reactions.resolve('👍').users.fetch()
		.then(userList => {
			console.log('UserList for Like:', userList);
			userList.forEach((user) => {
				if (!user.bot && user.id !== data.author_id) {
					players.push(`<@${user.id}>`);
				}
			});
			console.log('New party:', players);

			const editedLfgMessage = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Procura de Grupo')
				.setDescription(data.description)
				.addField('Jogo', data.game, false)
				.addField('Autor', `<@${data.author_id}>`, true)
				.addField('Jogadores', `${1 + players.length}/${data.players}`, true)
				.addField('Hora/Data Prevista', data.playAt.format('YYYY-MM-DD HH:mm'), true);

			if (players.length !== 0) {
				editedLfgMessage.addField('Aceite', players.join(' '));
			}

			editedLfgMessage
				.addField('\u200B', 'Reage com :thumbsup: para te juntares!')
				.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
				.setTimestamp()
				.setFooter('|lfg create', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

			original.edit(editedLfgMessage);
			console.log('Edited embed');
		});
}

module.exports = {
	name: 'lfg',
	guildOnly: true,
	args: true,
	description: 'Find a group of players for a gaming session',
	usage: 'Inicia um pedido de procura de grupo!'
		+ '\n `|lfg create`',
	async execute(message, args) {
		switch (args[0]) {
			case 'create': {
				const data = { author_id: message.author.id };
				const now = dayjs();
				let validAnswer = false;
				let hasAnswered = false;

				// deleting the original request
				message.delete();
				await message.author.createDM()
					.then(async dmchannel => {
						await dmchannel.send('Vamos criar um Looking for Group! Apenas tens 30 seg. entre perguntas para responder. No final, o post será criado por ti.');

						for (const questionName in questions) {
							do {
								validAnswer = false;
								hasAnswered = false;
								await dmchannel.send(questions[questionName].question);

								await dmchannel
									.awaitMessages(m => m.author.id === message.author.id && m.content, {
										max: 1,
										time: 30000,
										errors: ['time'],
									})
									.then(async collected => {
										hasAnswered = true;
										let answer = collected.last().content;

										if (!questions[questionName].validator.test(answer)) {
											await dmchannel.send('A tua mensagem não foi aceite, por favor tenta de novo.');

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
												await dmchannel.send('Data inválida! Apenas datas como "20-03-2021 18:30" ou apenas horas "20:00" são aceites.');

												return;
											}
											if (playAt.isSameOrBefore(now)) {
												await dmchannel.send('Data inválida! Apenas datas no futuro.');

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
							.addField('Autor', `<@${data.author_id}>`, true)
							.addField('Jogadores', `1/${data.players}`, true)
							.addField('Hora/Data Prevista', data.playAt.format('YYYY-MM-DD HH:mm'), true)
							.addField('\u200B', 'Reage com :thumbsup: para te juntares!')
							.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
							.setTimestamp()
							.setFooter('|lfg create', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

						await dmchannel.send(lfgMessage);
						await dmchannel.send('Aqui está um preview do teu pedido. Queres colocá-lo no canal? [sim/não]');

						let createItem = false;
						await dmchannel
							.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
							.then(async collected => {
								const answer = collected.last().content.toLowerCase().trim();
								if (answer === 'sim' || answer === 's') {
									createItem = true;
								}
							})
							.catch(async () => {
								await dmchannel.send('Time up.. no LFG will be created.');
							});

						if (createItem) {
							console.log('LFG approved. Creating the item on the db and sending it to the channel!');

							if (!await LfgManager.create(data)) {
								await dmchannel.send('Ocorreu um erro ao criar o pedido, tenta de novo dentro de momentos');
								return;
							}

							await MessageCreatorUtil.post(this, message.channel, lfgMessage).then(async m => {
								data['message_id'] = m.id;
								// insert reactions
								await m.react('👍');
								await m.react('❌');

								// wait for reactions
								const filter = (reaction) => {
									return ['👍', '❌'].includes(reaction.emoji.name);
								};

								const collector = m.createReactionCollector(filter, { time: data['playAt'].diff(now) });

								collector.on('collect', async (reaction, user) => {
									await handleReact(m, user, reaction.emoji.name);
									updateEmbed(m, data);
								});

								await dmchannel.send('O teu pedido foi criado com sucesso. Obrigado!');
							});
						}
						else {
							console.log('LFG cancelled. Nothing to see here.');
						}
					});
				break;
			}
		}
	},
};
