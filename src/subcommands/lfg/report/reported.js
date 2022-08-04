const LfgProfileManager = require('../../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../../service/lfg/lfgEventManager');

const { buildReportEmbed } = require('./utils');

module.exports = async function(message, args) {
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
};