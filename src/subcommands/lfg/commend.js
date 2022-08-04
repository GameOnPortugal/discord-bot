const LfgProfileManager = require('../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../service/lfg/lfgEventManager');
const LfgGamesManager = require('../../service/lfg/lfgGamesManager');

const PermissionsUtil = require('../../util/permissionsUtil');

const Discord = require('discord.js');

function buildCommendationEmbed(commend, userId) {
	const embed = new Discord.MessageEmbed()
		.setTitle('LFG Commendation')
		.setDescription(`${commend.detail}`)
		.setColor('#00ff00')
		.addField('Utilizador Recomendado', `<@${commend.report_user_id}>`, true)
		.addField('Recomendado Por', `<@${userId}>`, true)
		.setTimestamp(commend.createdAt)
		.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
		.setFooter('|lfg reports', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

	if (commend.lfg_game_id) {
		embed.addField('Jogo', `${commend.game.game} (${commend.game.id})`, true);
	}

	return embed;
}


module.exports = async function(message, args) {
	if (args.length < 3) {
		await message.reply('Comando inválido. Use `|lfg commend [gameId] <@username> <reason>`');
		return;
	}

	let i = 1;
	let game = null;
	const options = {
		isAdmin: false,
		hasLfgProfile: true,
		hasLfgGame: false,
	};

	if (args.length < 3) {
		await message.reply('Comando inválido. Use `|lfg commend [<game_id>] <@user> <details>`');
		return;
	}

	if (Number.isInteger(Number(args[i]))) {
		const gameId = args[1];
		game = await LfgGamesManager.getGameById(gameId);
		if (!game) {
			await message.reply('Não consegui encontrar o LFG Game.');
			return;
		}
		i++;
		options.hasLfgGame = true;
	}

	const details = args.slice(i + 1).join(' ');

	const user = await LfgProfileManager.getProfile(message.author.id);
	if (!user) {
		await message.reply('Não tens perfil LFG.');
		if (!(await PermissionsUtil.isAdmin(message.member))) {
			await message.reply('... E não tens permissão para fazer isso! Cria um pedido LFG ou entra num já existente.');
			return;
		}
		options.isAdmin = true;
		options.hasLfgProfile = false;
	}
	else if (user.is_banned) {
		message.reply('Foste banido do LFG. Não podes fazer recomendações.');
		return;
	}

	const commendsLeft = await LfgEventManager.getCommendsLeft(user);
	if (commendsLeft === 0) {
		message.reply('Não podes fazer mais recomendações, já atingiste o limite para os últimos 7 dias.');
		return;
	}

	const commendedUser = await LfgProfileManager.getProfile(message.mentions.users.first().id);
	if (!commendedUser) {
		await message.reply('Este utilizador não tem perfil LFG.');
		return;
	}

	let report = await LfgEventManager.createCommend(message.author.id, commendedUser, game, details, options);
	if (!report) {
		await message.reply('Ocorreu um erro ao criar o report.');
		return;
	}

	message.reply(
		`Recomendação criada com sucesso. Tens **${commendsLeft - 1}** recomendações restantes.` +
        '\nExiste um máximo de 5 recomendações por utilizador por semana.',
	);

	// the game property was not being updated on create so we need to query again
	report = await LfgEventManager.getEventById(report.id);
	const embed = buildCommendationEmbed(report, message.author.id);
	await message.channel.send(embed);
};