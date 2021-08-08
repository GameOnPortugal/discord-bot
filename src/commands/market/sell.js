const models = require('./../../models');
const Ad = models.Ad;

const MessageCreatorUtil = require('./../../util/messageCreatorUtil');

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
	description: 'Sell an item in the marketplace',
	usage: 'Cria um anúncio no canal anúncios'
		+ '\n Exemplos:'
		+ '\n'
		+ '\n `|sell`',
	async execute(message) {
		const data = { adType: 'sell', author_id: message.author.id };
		console.log('Message author ' + message.author.id);
		let sellMessage = null;

		// Delete the message prevent spam.
		message.delete();

		await message.author
			.createDM()
			.then(async dmchannel => {
				await dmchannel.send('Vamos criar o anúncio. Apenas tens 30 seg. entre perguntas para responder. No final, o post será criado por ti.');

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
						if (answer === 'sim' || answer === 's') {
							createItem = true;
						}
					})
					.catch(async () => {
						await dmchannel.send('Time up.. no ad will be created.');
					});

				if (createItem) {
					console.log('Ad approved. Creating the item on the db and sending it to the channel!');

					await MessageCreatorUtil.post(this, message, sellMessage).then(async m => { data['message_id'] = m.id; });

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
			});
	},
};
