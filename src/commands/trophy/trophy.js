const TrophyProfileManager = require('./../../service/trophy/trophyProfileManager');
const PsnCrawlService = require('./../../service/trophy/psnCrawlService');
const TrophiesManager = require('./../../service/trophy/trophyManager');

/**
 * Based on the trophy rarity gives the right amount of points
 *
 * @param {string} trophyUrl
 *
 * @returns {int}
 */
async function getPointsFromUrl(trophyUrl) {
	const trophyRarityPercentage = await PsnCrawlService.getPlatTrophyPercentage(trophyUrl);
	if (trophyRarityPercentage === null) {
		return 0;
	}
	if (trophyRarityPercentage > 30.01) {
		return 50;
	}
	if (trophyRarityPercentage > 15.01) {
		return 100;
	}
	if (trophyRarityPercentage > 8.01) {
		return 250;
	}
	if (trophyRarityPercentage > 5.01) {
		return 500;
	}
	if (trophyRarityPercentage > 2.01) {
		return 800;
	}
	if (trophyRarityPercentage > 0.6) {
		return 1250;
	}

	return 2000;
}

module.exports = {
	name: 'trophy',
	description: 'Claim a trophy',
	guildOnly: true,
	args: true,
	usage: 'Claim a trophy'
        + '\nExamples:'
        + '\n'
        + '\nUse `!trophy https://psnprofiles/game/username',
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

		const trophy = await TrophiesManager.findByUsernameAndUrl(trophyProfile, trophyUrl);
		if (trophy) {
			await message.author.send(
				'Este trofeu já foi reclamado em ' + trophy.createdAt
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nSe isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		const points = await getPointsFromUrl(trophyUrl);
		if (points === 0) {
			await message.author.send(
				'Deve ter havido um problema interno e não iria ser dado nenhum pontos pelo trofeu.'
                + '\nA tua mensagem foi eliminada uma vez que não foi aceite.'
                + '\nVolta a tentar, se isto for um erro por favor entra em contacto com o STAFF através do ModMail.',
			);

			await message.delete();

			return;
		}

		// Signal that trophy has been handled by bot
		const reactionEmoji = await message.guild.emojis.cache.find(emoji => emoji.name === 'plat');
		await message.react(reactionEmoji);

		await TrophiesManager.create(trophyProfile, trophyUrl, points);

		await message.author.send('Parabéns, troféu reclamado com successo!! Acabaste de receber ' + points + ' XP. Boa caça trophy hunter!');
	},
};
