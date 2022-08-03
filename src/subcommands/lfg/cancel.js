const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const LfgGamesManager = require('../../service/lfg/lfgGamesManager');
const LfgProfileManager = require('../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../service/lfg/lfgEventManager');

module.exports = async function(message, args) {
	if (args.length < 2) {
		await message.reply('Não tens especificado o ID do pedido a cancelar.');
		return;
	}
	const lfgGameId = args[1];
	const lfgGame = await LfgGamesManager.getGameById(lfgGameId);
	if (!lfgGame) {
		await message.reply('O pedido não existe.');
		return;
	}
	const lfgProfile = await LfgProfileManager.getProfile(message.author.id);
	if (!lfgProfile) {
		await message.reply('Não tens um perfil LFG.');
		return;
	}

	if (lfgGame.lfgProfile !== lfgProfile.id) {
		await message.reply('Não tens permissão para cancelar este pedido.');
	}

	// check if the game has been canceled already
	const canceled = await LfgEventManager.isGameCanceled(lfgGame);
	if (canceled) {
		await message.reply('Este pedido já foi cancelado.');
		return;
	}

	const playAt = dayjs(lfgGame.playAt);

	if (playAt.isBefore(dayjs())) {
		await message.reply('Este evento já começou, não podes cancelar.');
		return;
	}

	// near event if less than 1 hour to event with dayjs
	const nearEvent = playAt.diff(dayjs(), 'hour', true) < 1;

	// prompt user to confirm
	await message.reply(
		'Tem a certeza que quer cancelar o pedido? [sim/não]' +
            (nearEvent ? '\nEste evento está prestes a acontecer. Se cancelares perderás mais pontos!' : ''),
	);

	let cancelItem = false;
	await message.channel
		.awaitMessages((m) => m.author.id === message.author.id, {
			max: 1,
			time: 30000,
			errors: ['time'],
		})
		.then(async (collected) => {
			const answer = collected.last().content.toLowerCase().trim();
			if (answer === 'sim' || answer === 's') {
				cancelItem = true;
			}
			else if (answer === 'não' || answer === 'n' || answer === 'nao') {
				await message.reply('O pedido não foi cancelado.');
			}
		})
		.catch(async () => {
			await message.reply('Time up.. O pedido não foi cancelado.');
		});

	if (!cancelItem) {
		return;
	}

	const participants = await LfgGamesManager.getParticipants(lfgGame);
	participants.forEach(async (participant) => {
		console.log('Removing participation from:', participant);
		LfgEventManager.cancelEvent(participant.lfgProfile, lfgGame, false, nearEvent);
	});

	await LfgEventManager.cancelEvent(lfgProfile, lfgGame, true, nearEvent);

	await message.reply('LFG cancelado.');

	return;
};