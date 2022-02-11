const ScreenshotManager = require('./../../service/screenshot/screenshotManager');

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');
const MessageMentions = require('./../../util/messageMention');
const { MessageEmbed } = require('discord.js');
const emojiEnum = require('./../../enum/discord/emojiEnum');
const PermissionUtil = require('../../util/permissionsUtil');

const questions = {
	name: {
		question: 'Qual é o jogo? (Usa o nome completo como é maioritariamente conhecido aqui em Portugal, por exemplo em vez de "GOTG" usa "Guardians of the galaxy")',
	},
	plataform: {
		question: 'Qual foi a plataforma? (switch, ps, xbox, pc)',
	},
	image: {
		question: 'Anexa agora a imagem que queres colocar',
	},
};

module.exports = {
	name: 'screenshot',
	guildOnly: true,
	args: true,
	description: 'Adiciona um screenshot',
	usage: 'Cria um screenshot no canal screenshots'
		+ '\n Exemplos:'
		+ '\n'
		+ '\n `|screenshot create` - Adiciona um novo screenshot'
		+ '\n `|screenshot list [user]`- Lista todos os teus screenshots ou se dado um utilizador os screenshots desse utilizador'
		+ '\n `|screenshot delete id` - Apaga um dos teus screenshots, o id é o primeiro numero da lista dos teus screenshots!',
	async execute(message, args) {
		const data = { channel_id: message.channel.id, author_id: message.author.id };

		// Delete the message prevent spam.
		await message.delete();

		await message.author
			.createDM()
			.then(async dmchannel => {
				switch(args[0]) {
					case 'list': {
						let user = message.author;
						if (Object.prototype.hasOwnProperty.call(args, 1)) {
							user = await MessageMentions.getMessageMention(message.client, args[1]);
							if (!user) {
								await dmchannel.send('Utilizador nāo encontrado... por favor volta a tentar mais tarde!');

								return;
							}
						}

						const screenshots = await ScreenshotManager.findByUser(user);
						if (!screenshots.length) {
							await dmchannel.send(user.username + ' nāo têm nenhum screenshot de momento!');

							return;
						}

						let listMessage = 'Estes sāo os teus screenshots:\n';
						for (const screenshot of screenshots) {
							listMessage += '[ID: ' + screenshot.id + '][' + screenshot.plataform + '] ' + screenshot.name + '\n';
						}

						await dmchannel.send(listMessage);

						return;
					}
					case 'delete': {
						if (!Object.prototype.hasOwnProperty.call(args, 1)) {
							await dmchannel.send('Por favor coloca o ID do screenshot que pretendes apagar. Usa `|screenshot list` para saber qual é o ID que pretendes apagar');

							return;
						}

						const screenshotId = args[1];
						const screenshot = await ScreenshotManager.findById(screenshotId);
						if (!screenshot) {
							await dmchannel.send('Screenshot com o id "' + screenshotId + '" nāo existe. Usa `|screenshot list` para saber qual é o ID que pretendes apagar');

							return;
						}

						if (screenshot.author_id !== message.author.id && !(await PermissionUtil.isAdmin(message.member))) {
							await dmchannel.send('Este screenshot nāo te pertence! Usa `|screenshot list` para saber qual é o ID que pretendes apagar');

							return;
						}

						await ScreenshotManager.delete(message.client, screenshotId);

						await dmchannel.send('O teu screenshot foi apagado com sucesso. Obrigado!');

						return;
					}

					case 'create': {
						if (!await MessageCreatorUtil.lockInteraction(message.author.id)) {
							await dmchannel.send('Ainda nāo acabaste o teu pedido anterior!');

							return;
						}

						await dmchannel.send('Vamos criar o screenshot. Tens 60 segundos para cada pergunta para responder. No final, o post será criado por ti.');
						let hasAnswered = false;

						for (const questionName in questions) {
							await dmchannel.send(questions[questionName].question);

							await dmchannel
								.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000, errors: ['time'] })
								.then(async collected => {
									hasAnswered = true;
									console.log(questionName + ' = ' + collected.last().content);

									if (questionName === 'image') {
										data[questionName] = collected.last().attachments.first().url;
										data['image_md5'] = await ScreenshotManager.generateMD5(data.image);
									}
									else {
										data[questionName] = collected.last().content;
									}
								})
								.catch(async () => {
									hasAnswered = false;
									console.log('Time up... finishing');

									await dmchannel.send('Acabou o tempo... o screenshot não será criado.');
								});

							console.log('One question done moving to other...');

							if (!hasAnswered) {
								console.log('Not answered! Stopping');
								await MessageCreatorUtil.releaseLockInteraction(message.author.id);

								return;
							}
						}

						console.log('Collector ended. Data:', data);

						if (await ScreenshotManager.findByMD5(data.image_md5)) {
							await dmchannel.send('Esta imagem já foi submetida!');
							await MessageCreatorUtil.releaseLockInteraction(message.author.id);

							return;
						}

						const screenshotEmbedded = new MessageEmbed()
							.setColor('#0099ff')
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setImage(data.image)
							.addField('Jogo', data.name, true)
							.addField('Plataforma', data.plataform, true);

						await dmchannel.send(screenshotEmbedded);
						await dmchannel.send('Aqui está um preview do teu screenshot. Queres colocá-lo no canal? [sim/não]');

						let createItem = false;
						await dmchannel
							.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
							.then(async collected => {
								const answer = collected.last().content.toLowerCase().trim();
								if (answer === 'sim' || answer === 's' || answer === 'yes' || answer === 'yup') {
									createItem = true;
								}
							})
							.catch(async () => {
								await dmchannel.send('Acabou o tempo. Nada vai ser criado. Volta a tentar logo que disponhas de tempo!');
								await MessageCreatorUtil.releaseLockInteraction(message.author.id);
							});

						if (createItem) {
							console.log('Screenshot approved. Creating the item on the db and sending it to the channel!');

							await MessageCreatorUtil
								.post(this, message, screenshotEmbedded)
								.then(async m => {
									m.react(await message.client.emojis.cache.get(emojiEnum.TROPHY_PLAT));

									data['message_id'] = m.id;
									data['channel_id'] = m.channel.id;
								});

							ScreenshotManager
								.create(data)
								.then(async () => {
									await dmchannel.send('O teu screenshot foi criado com sucesso. Obrigado!');
								})
								.catch(error => {
									console.log(error);

									message.channel.send('Ocorreu um erro ao criar o teu post. Volta a tentar');
								});
						}
						else {
							console.log('Screenshot disapproved. Nothing to see here.');
						}


						await MessageCreatorUtil.releaseLockInteraction(message.author.id);

						return;
					}
				}
			});
	},
};
