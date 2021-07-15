const TrophyProfileManager = require('./../../service/trophy/trophyProfileManager');
const PsnCrawlService = require('./../../service/trophy/psnCrawlService');
const TrophiesManager = require('./../../service/trophy/trophyManager');

module.exports = {
	name: 'trophy',
	description: 'Claim a trophy',
	guildOnly: true,
	args: true,
	usage: 'Claim a trophy'
        + '\nExamples:'
        + '\n'
        + '\nUse `|trophy https://psnprofiles/game/username',
	async execute(message, args) {
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

			await message.delete();

			return;
		}

		let trophyProfile = await TrophyProfileManager.findByPsnProfile(psnProfileUsername);

		if (!trophyProfile) {
			trophyProfile = await TrophyProfileManager.create(psnProfileUsername, message.author);
		}

		if (trophyProfile.userId !== message.author.id) {
			await message.author.send(
				'Esta conta já foi reclamada por outro utilizador no servidor.'
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		let trophy = await TrophiesManager.findByUsernameAndUrl(trophyProfile, trophyUrl);
		if (trophy) {
			await message.author.send(
				'Este trofeu já foi reclamado em ' + trophy.createdAt
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		try {
			const trophyData = await PsnCrawlService.getPlatTrophyData(trophyUrl);

			// Signal that trophy has been handled by bot
			const reactionEmoji = await message.guild.emojis.cache.find(emoji => emoji.name === 'plat');
			await message.react(reactionEmoji);

			trophy = await TrophiesManager.create(trophyProfile, trophyUrl, trophyData);

			await message.channel.send('Parabéns <@' + message.author.id + '>! Acabaste de receber ' + trophy.points + ' TP (Trophy Points).');
		}
		catch (exception) {
			console.log('Problem creating trophy. Error: ' + exception.message);

			await message.author.send(
				'O bot encontrou o seguinte problema: ' + exception.message
				+ '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
				+ '\nSe isto for um erro do bot por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}
	},
};
