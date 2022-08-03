const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const LfgGamesManager = require('../../service/lfg/lfgGamesManager');
const LfgProfileManager = require('../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../service/lfg/lfgEventManager');
const PermissionsUtil = require('../../util/permissionsUtil');


module.exports = async function(message, args) {
	if (args.length < 4) {
		message.reply('Comando inválido. Use `lfg miss <game_id> <@user> <details>`');
		return;
	}

	const gameId = args[1];
	const targetUser = await LfgProfileManager.getProfile(message.mentions.users.first().id);
	const details = args.slice(3).join(' ');
	const user = await LfgProfileManager.getProfile(message.author.id);

	const options = {
		isAdmin: false,
		hasLfgProfile: true,
	};

	if (!user) {
		message.reply('Não tens um perfil LFG. Cria um pedido LFG ou entra num já existente!');
		if (!PermissionsUtil.isAdmin(message.member)) {
			message.reply('... E não tens permissão para fazer isso!');
			return;
		}
		options.hasLfgProfile = false;
		options.isAdmin = true;
	}
	else if (user.is_banned) {
		message.reply('Foste banido do LFG. Não podes fazer isto.');
		return;
	}

	if (!targetUser) {
		message.reply(`Não consegui encontrar o utilizador <@${targetUser.user_id}>`);
		return;
	}

	const lfgGame = await LfgGamesManager.getGameById(gameId);
	if (!lfgGame) {
		message.reply('Não consegui encontrar o LFG Game.');
		return;
	}

	// game has to be at least 5 min in
	const playAt = dayjs(lfgGame.playAt);
	console.log('playAt:', playAt.toISOString());
	if (dayjs().isBefore(playAt.add(5, 'minutes'))) {
		message.reply('Só podes reportar a falta se o jogo tiver começado há pelo menos 5 minutos.');
		return;
	}

	const participants = await LfgGamesManager.getParticipants(lfgGame);
	const participantsIds = participants.map((p) => p.lfgProfile.id);
	if (!participantsIds.includes(targetUser.id)) {
		message.reply('Este utilizador não está no jogo.');
		return;
	}

	const miss = await LfgEventManager.missEvent(message.author.id, targetUser, lfgGame, details, options);
	if (!miss) {
		message.reply('Ocorreu um erro ao reportar a falta ou já foi reportada anteriormente.');
		return;
	}
	message.reply('Falta reportada com sucesso. Obrigado.');
};