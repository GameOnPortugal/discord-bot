const models = require('./../../models');
const Ad = models.Ad;

const questions = {
	name: {
		question: 'Qual o nome do artigo que procuras?',
	},
	state: {
		question: 'Tens alguma preferência pelo estado do artigo? [novo, selado, usado, qualquer um]',
	},
	price: {
		question: 'Qual é o preço máximo que queres dar por este artigo? [50€]',
	},
	zone: {
		question: 'Qual é a zona ou zonas pela qual estás disposto a ir para fazer negócio em mão? [Porto, Porto e Lisboa, envio apenas]',
	},
	dispatch: {
		question: 'Aceitas receber o artigo por correio? [sim, sim mas apenas correio registado]',
	},
	warranty: {
		question: 'Tens alguma preferência pela garantia do produto? [sim com pelo menos 3 meses, não]',
	},
	description: {
		question: 'Queres descrever o anuncio? Responde com "não" se não quiseres adicionar uma descrição ao anúncio.',
	},
};

module.exports = {
	name: 'wanted',
	aliases: ['want', 'procuro'],
	guildOnly: true,
	description: 'Place a wanted ad for an item in the marketplace',
	async execute(message) {
		const data = { adType: 'wanted', author_id: message.author.id };
		console.log('Message author ' + message.author.id);
		let wantedMessage = null;

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

				wantedMessage = ':mag: **PROCURO**'
					+ `\n:arrow_right: **${data.name}**`
					+ `\n:dollar: **Preço:** ${data.price}`
					+ `\n:bust_in_silhouette: <@${message.author.id}>`
					+ `\n\n**Zona:** ${data.zone}`
					+ `\n**Estado:** ${data.state}`
					+ `\n**Envio:** ${data.dispatch}`
					+ `\n**Garantia:** ${data.warranty}`
					+ (data.description ? `\n\n${data.description}` : '');

				await dmchannel.send(wantedMessage);
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

					await message.channel.send(wantedMessage).then(async m => { data['message_id'] = m.id; });

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
