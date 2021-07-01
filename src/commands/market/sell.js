const Discord = require('discord.js');

const models = require('./../../models');
const MarketItem = models.MarketItem;

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
		question: 'Queres descrever o anuncio? Responde com "não" se não quiseres adicionar uma descrição ao anúncio.',
	},
};

module.exports = {
	name: 'sell',
	guildOnly: true,
	description: 'Sell an item in the marketplace',
	async execute(message) {
		// Delete the message prevent spam.
		message.delete();

		const data = { adType: 'sell' };
		let embeddedMessage = null;

		await message.author
			.createDM()
			.then(async dmchannel => {
				await dmchannel.send('Vamos criar o anúncio. Apenas tens 30seg entre perguntas para responder. No final o post será criado por ti.');

				let hasAnswered = false;

				for (const questionName in questions) {
					await dmchannel.send(questions[questionName].question);

					await dmchannel
						.awaitMessages(m => m.author.id === message.author.id && m.content, { max: 1, time: 30000, errors: ['time'] })
						.then(async collected => {
							hasAnswered = true;
							console.log(questionName + ' = ' + collected.last().content);

							data[questionName] = collected.last().content;
						})
						.catch(async () => {
							hasAnswered = false;
							console.log('Times up... finishing');

							await dmchannel.send('Acabou o tempo... o anúncio não será criado.');
						});

					console.log('One question done moving to other...');

					if (!hasAnswered) {
						console.log('Not answered! Stopping');

						return;
					}
				}

				if (data.description && data.description.toLowerCase().trim() === 'não' || data.description.toLowerCase().trim() === 'nao') {
					console.log('Description not wanted. Removing it');
					data.description = null;
				}

				console.log('Collector ended. Data:', data);

				embeddedMessage = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(data.name)
					.setAuthor(message.author.username, message.author.avatarURL())
					.addField('Estado', data.state)
					.addField('Preço', data.price)
					.addField('Envio', data.dispatch)
					.addField('Garantia', data.warranty)
					.addField('Contacto', '<@' + message.author.id + '>')
					.setTimestamp()
				;

				if (data.description) {
					embeddedMessage.setDescription(data.description);
				}

				await dmchannel.send(embeddedMessage);
				await dmchannel.send('Aqui está um preview do teu anúncio. Queres coloca-lo no canal? [sim/nao]');

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
					console.log('Ad approved. Creating the item on the db and sending it to the channel!');

					MarketItem
						.create(data)
						.then(async () => {
							await message.channel.send(embeddedMessage);
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
			});
	},
};