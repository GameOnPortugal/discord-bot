const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const Discord = require('discord.js');
const LfgGamesManager = require('../../service/lfg/lfgGamesManager');
const LfgProfileManager = require('./../../service/lfg/lfgProfileManager');
const LfgEventManager = require('./../../service/lfg/lfgEventManager');

const PermissionsUtil = require('../../util/permissionsUtil');
const { getMonthFromInput } = require('../../util/dateUtil');

const createCommand = require('../../subcommands/lfg/create');
const cancelCommand = require('../../subcommands/lfg/cancel');
const missCommand = require('../../subcommands/lfg/miss');

function buildReportEmbed(report, userId) {
	const embed = new Discord.MessageEmbed()
		.setTitle('LFG Report')
		.setDescription(`${report.detail}`)
		.setColor(report.is_addressed ? '#00ff00' : '#0000ff')
		.addField('Reportado', `<@${report.report_user_id}>`, true)
		.addField('Reportado Por', `<@${userId}>`, true)
		.addField('Status', report.is_addressed ? 'Resolvido' : 'Aberto', true)
		.addField('ID', report.id, true)
		.setTimestamp(report.createdAt)
		.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
		.setFooter('|lfg reports', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

	if (report.lfg_game_id) {
		embed.addField('Jogo', `${report.game.game} (${report.game.id})`, true);
	}

	if (report.is_addressed) {
		embed.addField('Pontos', report.points);
		embed.addField('Admin', report.admin_user_id ? `<@${report.admin_user_id}>` : 'N/A');
		embed.addField('Notas Admin', report.admin_note ? report.admin_note : 'N/A');
	}


	return embed;
}

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

const lfgCommands = {
	'create': createCommand,
	'cancel': cancelCommand,
	'miss': missCommand,
};

module.exports = {
	name: 'lfg',
	guildOnly: true,
	args: true,
	description: 'Find a group of players for a gaming session',
	usage: 'Inicia um pedido de procura de grupo!' +
	'\n `|lfg create`' +
	'\n `|lfg cancel <id>`' +
	'\n `|lfg miss <game_id> <@user> <Details>`' +
	'\n `|lfg report [<game_id>] <@user> <reason>`' +
	'\n `|lfg reports [<@user>]`' +
	'\n `|lfg reported [<@user>]`' +
	'\n `|lfg resolve <report_id> <points> <notes>`' +
	'\n `|lfg commend [<gane_id>] <@user> <reason>`' +
	'\n `|lfg ban <@user> <reason>`' +
	'\n `|lfg unban <@user> <reason>`',
	async execute(message, args) {
		// remove message
		message.delete();

		// see if args[0] is a subcommand
		if (args[0] in lfgCommands) {
			// call method with this module as context
			return await lfgCommands[args[0]].call(this, message, args);
		}

		await message.reply(`Comando \`${args[0]}\` ainda não foi refatorizado!`);


		switch (args[0]) {
			case 'report': {
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

				return;
			}
			case 'reports': {
				if (args.length > 2) {
					message.reply('Comando inválido. Use `lfg reports [<@user_id>]`');
					return;
				}

				let userId = message.author.id;

				if (args.length === 2) {
					userId = message.mentions.users.first().id;
				}

				// get LFGProfile
				const lfgProfile = await LfgProfileManager.getProfile(userId);
				if (!lfgProfile) {
					message.reply('Este utilizador não tem perfil LFG.');
					return;
				}

				// get reports
				const reports = await LfgEventManager.getReportsDoneByUser(lfgProfile);
				if (reports.length === 0) {
					message.reply(`Utilizador <@${userId}> não reportou nenhum utilizador.`);
					return;
				}

				message.reply(`Aqui estão os reports feitos por <@${userId}>:`);
				// send reports
				for (const report of reports) {
					const embed = buildReportEmbed(report, userId);
					message.channel.send(embed);
				}
				return;
			}
			case 'reported': {
				if (args.length > 2) {
					message.reply('Comando inválido. Use `lfg reported [<@user_id>]`');
					return;
				}
				let userId = message.author.id;
				if (args.length === 2) {
					userId = message.mentions.users.first().id;
				}
				// get LFGProfile
				const lfgProfile = await LfgProfileManager.getProfile(userId);
				if (!lfgProfile) {
					message.reply('Este utilizador não tem perfil LFG.');
					return;
				}
				// get reports
				const reports = await LfgEventManager.getReportsDoneToUser(lfgProfile);

				if (reports.length === 0) {
					message.reply(`Utilizador <@${userId}> não recebeu nenhum report.`);
					return;
				}
				message.reply(`Aqui estão os reports feitos para <@${userId}>:`);
				// send reports
				for (const report of reports) {
					const embed = buildReportEmbed(report, report.lfgProfile.user_id);
					message.channel.send(embed);
				}

				return;
			}
			case 'resolve': {
				if (args.length < 3) {
					message.reply('Comando inválido. Use `|lfg resolve <id> <points> [note...]`');
					return;
				}

				// only admins can do this
				if (!(await PermissionsUtil.isAdmin(message.member)) && process.env.NODE_ENV !== 'development') {
					message.reply('Não tens permissão para fazer isso!');
					return;
				}

				const id = args[1];
				const points = parseInt(args[2]);
				if (isNaN(points)) {
					message.reply('Comando inválido. Use `|lfg resolve <id> <points> [note...]`');
					return;
				}

				const note = args.slice(3).join(' ');
				// get report
				const report = await LfgEventManager.getEventById(id);

				if (!report || report.type !== 'report') {
					message.reply('Report inválido.');
					return;
				}
				if (report.is_addressed) {
					message.reply('Report já foi resolvido.');
					return;
				}

				// resolve report
				const resolved = await LfgEventManager.resolveReport(report, points, note, message.author.id);
				if (!resolved) {
					message.reply('Ocorreu um erro ao resolver o report.');
					return;
				}

				message.reply('Report resolvido com sucesso.');
				return;
			}
			case 'commend': {
				if (args.length < 3) {
					message.reply('Comando inválido. Use `|lfg commend [gameId] <@username> <reason>`');
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
					message.reply('Comando inválido. Use `|lfg commend [<game_id>] <@user> <details>`');
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

				const details = args.slice(i + 1).join(' ');

				const user = await LfgProfileManager.getProfile(message.author.id);
				if (!user) {
					message.reply('Não tens perfil LFG.');
					if (!(await PermissionsUtil.isAdmin(message.member))) {
						message.reply('... E não tens permissão para fazer isso! Cria um pedido LFG ou entra num já existente.');
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
					message.reply('Este utilizador não tem perfil LFG.');
					return;
				}

				let report = await LfgEventManager.createCommend(message.author.id, commendedUser, game, details, options);
				if (!report) {
					message.reply('Ocorreu um erro ao criar o report.');
					return;
				}

				message.reply(
					`Recomendação criada com sucesso. Tens **${commendsLeft - 1}** recomendações restantes.` +
					'\nExiste um máximo de 5 recomendações por utilizador por semana.',
				);

				// the game property was not being updated on create so we need to query again
				report = await LfgEventManager.getEventById(report.id);
				const embed = buildCommendationEmbed(report, message.author.id);
				message.channel.send(embed);

				return;
			}
			case 'rank': {
				const rankType = args[1] ? args[1].toLowerCase() : 'monthly';

				if (rankType === 'lifetime') {
					const sortedLfgProfiles = await LfgProfileManager.getRankLifetime();
					let rankMessage = '';

					for (let i = 0; i < sortedLfgProfiles.length; i++) {
						rankMessage += `\`${i + 1}.\` <@${sortedLfgProfiles[i].user_id}> with **${sortedLfgProfiles[i].points}** points\n`;
					}

					rankMessage = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('Top Lifetime LFG Profiles')
						.setDescription(rankMessage)
						.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
						.setTimestamp()
						.setFooter('|lfg rank lifetime', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

					message.channel.send(rankMessage);
					return;
				}
				if (rankType === 'monthly') {
					let month = new Date().getMonth();
					let year = new Date().getFullYear();
					if (args.length == 3) {
						try {
							const monthDate = getMonthFromInput(args[2]);
							month = monthDate.getMonth();
							year = monthDate.getFullYear();
						}
						catch (e) {
							message.reply('Data inválida.');
							return;
						}
					}

					const allProfiles = await LfgProfileManager.getAllValidProfiles();
					for (let i = 0; i < allProfiles.length; i++) {
						const profile = allProfiles[i];
						const points = await LfgEventManager.getPointsMonthly(profile, new Date(year, month, 1));
						profile.points = points;
					}

					const sortedLfgProfiles = allProfiles.sort((a, b) => b.points - a.points);
					let rankMessage = '';

					for (let i = 0; i < sortedLfgProfiles.length; i++) {
						rankMessage += `\`${i + 1}.\` <@${sortedLfgProfiles[i].user_id}> with **${sortedLfgProfiles[i].points}** points\n`;
					}

					rankMessage = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('Top Monthly LFG Profiles')
						.setDescription(rankMessage)
						.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
						.setTimestamp()
						.setFooter('|lfg rank monthly', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

					message.channel.send(rankMessage);

					return;
				}

				message.reply('Comando inválido. Use `|lfg rank <lifetime|monthly [month]>`');
				return;
			}
			case 'ban': {
				if (args.length < 3) {
					message.reply('Comando inválido. Use `|lfg ban <user> <reason>`');
					return;
				}

				if (!PermissionsUtil.isAdmin(message.member) && process.env.NODE_ENV !== 'development') {
					message.reply('Apenas admins podem banir utilizadores.');
					return;
				}

				const user = message.mentions.users.first();
				const lfgProfile = await LfgProfileManager.getProfile(user.id);
				if (!lfgProfile) {
					message.reply('Este utilizador não tem perfil LFG.');
					return;
				}
				if (lfgProfile.is_banned) {
					message.reply('Este utilizador já está banido.');
					return;
				}

				const reason = args.slice(2).join(' ');
				await LfgEventManager.banUser(message.author.id, lfgProfile, reason);
				await LfgProfileManager.banUser(lfgProfile);

				message.reply(`Utilizador <@${user.id}> foi banido do sistema LFG.`);

				// also send to channel #lfg-moderation 1003663012256825484
				const lfgModerationChannel = message.guild.channels.cache.get('1003663012256825484');
				if (lfgModerationChannel) {
					const embed = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('LFG User Banned')
						.setDescription(`<@${user.id}> foi banido do sistema LFG.`)
						.addField('Admin', `<@${message.author.id}>`)
						.addField('Motivo', reason)
						.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
						.setTimestamp()
						.setFooter('|lfg ban', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

					lfgModerationChannel.send(embed);
				}

				return;
			}
			case 'unban': {
				if (args.length < 3) {
					message.reply('Comando inválido. Use `|lfg unban <user> <reason>`');
					return;
				}

				if (!PermissionsUtil.isAdmin(message.member) && process.env.NODE_ENV !== 'development') {
					message.reply('Apenas admins podem readmitir utilizadores.');
					return;
				}

				const user = message.mentions.users.first();
				const lfgProfile = await LfgProfileManager.getProfile(user.id);
				if (!lfgProfile) {
					message.reply('Este utilizador não tem perfil LFG.');
					return;
				}
				if (!lfgProfile.is_banned) {
					message.reply('Este utilizador não está banido.');
					return;
				}

				const reason = args.slice(2).join(' ');
				await LfgEventManager.unbanUser(message.author.id, lfgProfile, reason);
				await LfgProfileManager.unbanUser(lfgProfile);

				message.reply(`Utilizador <@${user.id}> foi readmitido no sistema LFG.`);

				// also send to channel #lfg-moderation 1003663012256825484
				const lfgModerationChannel = message.guild.channels.cache.get('1003663012256825484');
				if (lfgModerationChannel) {
					const embed = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('LFG User Unbanned')
						.setDescription(`<@${user.id}> foi readmitido no sistema LFG.`)
						.addField('Admin', `<@${message.author.id}>`)
						.addField('Motivo', reason)
						.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
						.setTimestamp()
						.setFooter('|lfg unban', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

					lfgModerationChannel.send(embed);
				}
				return;
			}
		}

		await message.reply(
			'Comando inválido. Usa `|lfg help` para saber como usar este comando!',
		);
	},
};
