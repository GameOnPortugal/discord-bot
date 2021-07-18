const Discord = require('discord.js');
const models = require('./../../models');
const Lfg = models.LookingForGroup;

const questions = {
	game: {
		question: 'Qual é o nome do jogo?',
		validator: /^.*$/,
	},
	description: {
		question: 'Adiciona uma descrição ao teu anúncio!',
		validator: /^.*$/,
	},
	players: {
		question: 'Tamanho do grupo?',
		validator: /^[1-9][0-9]*$/,
	},
	playAt: {
		question: 'Quando está prevista a sessão de jogo (HH:MM)?',
		validator: /^([0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
	},
};

module.exports = {
	name: 'lfg',
	guildOnly: true,
	args: true,
	description: 'Find a group of players for a gaming session',
	usage: 'Inicia um pedido de procura de grupo!\n' +
		'`|lfg create`',
	async execute(message, args) {
		switch (args[0]) {
			case 'create': {
				const data = { author_id: message.author.id };

				// deleting the original request
				message.delete();
				await message.author.createDM()
					.then(async dmchannel => {
						await dmchannel.send('Vamos criar um Looking for Group! Apenas tens 30 seg. entre perguntas para responder. No final, o post será criado por ti.');

						for (const questionName in questions) {
							let validAnswer = false;
							do {
								let hasAnswered = false;
								await dmchannel.send(questions[questionName].question);

								await dmchannel
									.awaitMessages(m => m.author.id === message.author.id && m.content, { max: 1, time: 30000, errors: ['time'] })
									.then(async collected => {
										hasAnswered = true;

										if (questions[questionName].validator.test(collected.last().content)) {
											validAnswer = true;
										}
										else {
											await dmchannel.send('A tua mensagem não foi aceite, por favor tenta de novo.');
										}

										data[questionName] = collected.last().content;
									})
									.catch(async () => {
										hasAnswered = false;
										console.log('Times up... finishing');

										await dmchannel.send('Acabou o tempo... o pedido não será criado.');
									});

								if (!hasAnswered) {
									console.log('Not answered! Stopping');
									return;
								}
							} while (!validAnswer);
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
							.addField('Hora Prevista', data.playAt, true)
							// TODO: add react listeners and uncomment line bellow
							// .addField('\u200B', 'Reage com :thumbsup: para te juntares!')
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
								await dmchannel.send('Time up.. no ad will be created.');
							});

						if (createItem) {
							console.log('Lfg approved. Creating the item on the db and sending it to the channel!');

							await message.channel.send(lfgMessage).then(async m => { data['message_id'] = m.id; });

							Lfg
								.create(data)
								.then(async () => {
									await dmchannel.send('O teu pedido foi criado com sucesso. Obrigado!');
								})
								.catch(error => {
									console.log(error);
									message.channel.send('Error while creating the item.');
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
