const LfgProfileManager = require('../../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../../service/lfg/lfgEventManager');

const { buildReportEmbed } = require('./utils');

module.exports = async function(message, args) {
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
		await message.reply('Este utilizador não tem perfil LFG.');
		return;
	}

	// get reports
	const reports = await LfgEventManager.getReportsDoneByUser(lfgProfile);
	if (reports.length === 0) {
		await message.reply(`Utilizador <@${userId}> não reportou nenhum utilizador.`);
		return;
	}

	message.reply(`Aqui estão os reports feitos por <@${userId}>:`);
	// send reports
	for (const report of reports) {
		const embed = buildReportEmbed(report, userId);
		await message.channel.send(embed);
	}
};