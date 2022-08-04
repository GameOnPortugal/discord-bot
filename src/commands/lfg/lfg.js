const createCommand = require('../../subcommands/lfg/create');
const cancelCommand = require('../../subcommands/lfg/cancel');
const missCommand = require('../../subcommands/lfg/miss');
const reportCommand = require('../../subcommands/lfg/report/report');
const resolveCommand = require('../../subcommands/lfg/report/resolve');
const reportsCommand = require('../../subcommands/lfg/report/reports');
const reportedCommand = require('../../subcommands/lfg/report/reported');
const commendCommand = require('../../subcommands/lfg/commend');
const rankCommand = require('../../subcommands/lfg/rank');
const banCommand = require('../../subcommands/lfg/ban');
const unbanCommand = require('../../subcommands/lfg/unban');

const lfgCommands = {
	'create': createCommand,
	'cancel': cancelCommand,
	'miss': missCommand,
	'report': reportCommand,
	'resolve': resolveCommand,
	'reports': reportsCommand,
	'reported': reportedCommand,
	'commend': commendCommand,
	'rank': rankCommand,
	'ban': banCommand,
	'unban': unbanCommand,
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
		message.delete();

		if (args[0] in lfgCommands) {
			return await lfgCommands[args[0]].call(this, message, args);
		}

		await message.reply(
			'Comando inválido. Usa `|lfg help` para saber como usar este comando!',
		);
	},
};
