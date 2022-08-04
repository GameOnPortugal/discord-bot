const LfgEventManager = require('../../../service/lfg/lfgEventManager');
const PermissionsUtil = require('../../../util/permissionsUtil');
const LfgProfileManager = require('../../../service/lfg/lfgProfileManager');

const { buildReportEmbed } = require('./utils');

module.exports = async function(message, args) {
	if (args.length < 3) {
		await message.reply('Comando inválido. Use `|lfg resolve <id> <points> [note...]`');
		return;
	}

	// only admins can do this
	if (!(await PermissionsUtil.isAdmin(message.member)) && process.env.NODE_ENV !== 'development') {
		await message.reply('Não tens permissão para fazer isso!');
		return;
	}

	const id = args[1];
	const points = parseInt(args[2]);
	if (isNaN(points)) {
		await message.reply('Comando inválido. Use `|lfg resolve <id> <points> [note...]`');
		return;
	}

	const note = args.slice(3).join(' ');
	// get report
	const report = await LfgEventManager.getEventById(id);

	if (!report || report.type !== 'report') {
		await message.reply('Report inválido.');
		return;
	}
	if (report.is_addressed) {
		await message.reply('Report já foi resolvido.');
		return;
	}

	// resolve report
	const resolved = await LfgEventManager.resolveReport(report, points, note, message.author.id);
	if (!resolved) {
		await message.reply('Ocorreu um erro ao resolver o report.');
		return;
	}

	const profile = await LfgProfileManager.getProfile(report.lfg_profile_id);
	const reporterId = profile ? profile.user_id : report.admin_user_id;

	// send report embed
	const embed = buildReportEmbed(report, reporterId);
	await message.channel.send(embed);
};