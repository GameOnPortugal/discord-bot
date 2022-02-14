const models = require('./../../models');
const Ad = models.Ad;

const AdManager = require('./../../service/market/adManager');

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');
const MessageMentions = require('./../../util/messageMention');
const PermissionUtil = require('./../../util/permissionsUtil');

const questions = {
	name: {
		question: 'Qual o nome do artigo?',
	},
	state: {
		question: 'Qual o estado do artigo?',
	},
	price: {
		question: 'Qual é o preço do artigo?',
	},
	zone: {
		question: 'Onde é que o artigo se encontra?',
	},
	dispatch: {
		question: 'Aceita propostas a enviar por correios?',
	},
	warranty: {
		question: 'O artigo ainda está em garantia? Se sim indique também a data fim. (e.g.: "Sim, termina a 10/2021")',
	},
	description: {
		question: 'Queres descrever o anúncio? Responde com "não" se não quiseres adicionar uma descrição ao anúncio.',
	},
};

module.exports = {
	name: 'sell',
	guildOnly: true,
	args: true,
	description: 'Sell an item in the marketplace',
	usage: 'Cria um anúncio no canal anúncios'
		+ '\n Exemplos:'
		+ '\n'
		+ '\n `|sell create` - Cria um novo anuncio'
		+ '\n `|sell list [user]`- Lista todos os teus anuncios ou se dado um utilizador os anuncios desse utilizador'
		+ '\n `|sell delete id` - Apaga um dos teus anuncios, o id é o primeiro numero da lista dos teus anuncios!',
	async execute(message, args) {
		const data = { adType: 'sell', author_id: message.author.id };
		console.log('Message author ' + message.author.id);
		let sellMessage = null;

		// Delete the message prevent spam.
		message.delete();

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

						const ads = await AdManager.findAdsByUser(user);
						if (!ads.length) {
							await dmchannel.send(user.username + ' nāo têm nenhum anúncio de momento!');

							return;
						}

						let adListMessage = 'Estes sāo os teus anúncios:\n';
						for (const ad of ads) {
							adListMessage += '[ID: ' + ad.id + '][' + ad.adType + '] ' + ad.name + '\n';
						}

						await MessageCreatorUtil.sendMessage(dmchannel, adListMessage);

						return;
					}
					case 'delete': {
						if (!Object.prototype.hasOwnProperty.call(args, 1)) {
							await dmchannel.send('Por favor coloca o ID do anúncio que pretendes apagar. Usa `|sell list` para saber qual é o ID que pretendes apagar');

							return;
						}

						const adId = args[1];
						const ad = await AdManager.findById(adId);
						if (!ad) {
							await dmchannel.send('Anúncio com o id "' + adId + '" nāo existe. Usa `|sell list` para saber qual é o ID que pretendes apagar');

							return;
						}

						if (ad.author_id !== message.author.id && !(await PermissionUtil.isAdmin(message.member))) {
							await dmchannel.send('Este anúncio nāo te pertence! Usa `|sell list` para saber qual é o ID que pretendes apagar');

							return;
						}

						await AdManager.delete(message.client, adId);

						await dmchannel.send('O teu anúncio foi apagado com sucesso. Obrigado!');

						return;
					}

					case 'create': {
						if (!await MessageCreatorUtil.lockInteraction(message.author.id)) {
							await dmchannel.send('Ainda nāo acabaste o teu pedido anterior!');

							return;
						}

						await dmchannel.send('Vamos criar o anúncio. Tens 60 segundos para responder a cada pergunta. No final, o post será criado por ti.');
						let hasAnswered = false;

						for (const questionName in questions) {
							await dmchannel.send(questions[questionName].question);

							await dmchannel
								.awaitMessages(m => m.author.id === message.author.id && m.content, { max: 1, time: 60000, errors: ['time'] })
								.then(async collected => {
									hasAnswered = true;
									console.log(questionName + ' = ' + collected.last().content);

									data[questionName] = collected.last().content;
								})
								.catch(async () => {
									hasAnswered = false;
									console.log('Time up... finishing');

									await dmchannel.send('Acabou o tempo... o anúncio não será criado.');
								});

							console.log('One question done moving to other...');

							if (!hasAnswered) {
								console.log('Not answered! Stopping');

								return;
							}
						}

						const resposta = data.description ? data.description.toLowerCase().trim() : null;
						if (!resposta || resposta === 'não' || resposta === 'nao' || resposta === 'n' || resposta === 'nop' || resposta === 'nope') {
							console.log('Description not wanted. Removing it');
							data.description = null;
						}

						console.log('Collector ended. Data:', data);

						sellMessage = ':moneybag: **VENDO**'
							+ `\n:arrow_right: **${data.name}**`
							+ `\n:dollar: **Preço:** ${data.price}`
							+ `\n:bust_in_silhouette: <@${message.author.id}>`
							+ `\n\n**Zona:** ${data.zone}`
							+ `\n**Estado:** ${data.state}`
							+ `\n**Envio:** ${data.dispatch}`
							+ `\n**Garantia:** ${data.warranty}`
							+ (data.description ? `\n\n${data.description}` : '');

						await dmchannel.send(sellMessage);
						await dmchannel.send('Aqui está um preview do teu anúncio. Queres colocá-lo no canal? [sim/não]');

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
								await dmchannel.send('Acabou o tempo. Nenhum ad vai ser criado. Volta a tentar logo que disponhas tempo!');
							});

						if (createItem) {
							console.log('Ad approved. Creating the item on the db and sending it to the channel!');

							let newMessage = await MessageCreatorUtil.post(this, message.channel, sellMessage);
							data['message_id'] = newMessage.id;
							data['channel_id'] = newMessage.channel.id;

							Ad
								.create(data)
								.then(async () => {
									await dmchannel.send('O teu anúncio foi criado com sucesso. Obrigado!');
								})
								.catch(error => {
									console.log(error);

									message.channel.send('Error while creating the item.');
								});
						}
						else {
							console.log('Ad disapproved. Nothing to see here.');
						}

						await MessageCreatorUtil.releaseLockInteraction(message.author.id);

						return;
					}
				}
			});
	},
};
