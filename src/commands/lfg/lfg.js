// const models = require('./../../models');
// const Lfg = models.LookingForGroup;

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
		question: 'Número de jogadores pretendidos?',
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
	description: 'Find a group of players for a gaming session',
	async execute(message) {
		const data = { author_id: message.author.id };

		// deleting the original request
		message.delete();
		await message.author.createDM()
			.then(async dmchannel => {
				await dmchannel.send('Vamos criar um Looking for Group! Apenas tens 30 seg. entre perguntas para responder. No final, o post será criado por ti.');

				let hasAnswered = false;

				for (const questionName in questions) {
					let validAnswer = false;
					do {
						await dmchannel.send(questions[questionName].question);

						await dmchannel
							.awaitMessages(m => m.author.id === message.author.id && m.content, { max: 1, time: 300000, errors: ['time'] })
							.then(async collected => {
								hasAnswered = true;

								if (questions[questionName].validator.test(collected.last().content)) {
									validAnswer = true;
								}
								else {
									await dmchannel.send('Parece que a tua mensagem não foi aceite, vamos tentar de novo!');
								}

								data[questionName] = collected.last().content;
							})
							.catch(async () => {
								hasAnswered = false;
								console.log('Times up... finishing');

								await dmchannel.send('Acabou o tempo... o anúncio não será criado.');
							});

						if (!hasAnswered) {
							console.log('Not answered! Stopping');
							return;
						}
					} while (!validAnswer);
				}

				// after information gathering
				console.log('gathered information: ' + data);
			});
	},
};
