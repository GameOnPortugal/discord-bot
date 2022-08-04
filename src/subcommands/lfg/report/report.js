const LfgGamesManager = require('../../../service/lfg/lfgGamesManager');
const LfgProfileManager = require('../../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../../service/lfg/lfgEventManager');
const PermissionsUtil = require('../../../util/permissionsUtil');

const { buildReportEmbed } = require('./utils');

module.exports = async function(message, args) {
	let i = 1;
	let game = null;
	const options = {
		isAdmin: false,
		hasLfgProfile: true,
		hasLfgGame: false,
	};

	if (args.length < 3) {
		message.reply('Comando inválido. Use `lfg report [<game_id>] <@user> <details>`');
		return;
	}

	if (Number.isInteger(Number(args[i]))) {
		const gameId = args[1];
		game = await LfgGamesManager.getGameById(gameId);
		if (!game) {
			message.reply('Não consegui encontrar o LFG Game.');
			return;
		}
		i++;
		options.hasLfgGame = true;
	}

	const user = await LfgProfileManager.getProfile(message.author.id);
	const details = args.slice(i + 1).join(' ');

	if (!user) {
		message.reply('Não tens um perfil LFG!');
		if (!(await PermissionsUtil.isAdmin(message.member))) {
			message.reply('... E não tens permissão para fazer isso! Cria um pedido LFG ou entra num já existente!');
			return;
		}
		options.hasLfgProfile = false;
		options.isAdmin = true;
	}

	const reportedUser = await LfgProfileManager.getProfile(message.mentions.users.first().id);
	if (!reportedUser) {
		message.reply(`O utilizador <@${message.mentions.users.first().id}> não tem perfil LFG.`);
		return;
	}

	const reportEvent = await LfgEventManager.reportEvent(
		message.author.id,
		reportedUser,
		game,
		details,
		options,
	);
	if (!reportEvent) {
		message.reply('Ocorreu um erro ao reportar o utilizador.');
		return;
	}
	message.reply('Utilizador reportado com sucesso. Obrigado.');

	// enviar mensagem para canal ID: 1003663012256825484
	const channel = message.client.channels.cache.get('1003663012256825484');
	if (channel) {
		const report = await LfgEventManager.getEventById(reportEvent.id);
		const embed = buildReportEmbed(report, message.author.id);
		channel.send(embed);
	}
};