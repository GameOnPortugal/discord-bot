const { LFG_EVENTS } = require('../../enum/discord/lfgEventsEnum');
const models = require('../../models');
const lfgProfileManager = require('./lfgProfileManager');
const LFGEvent = models.LFGEvent;


module.exports = {
	createGameEvent: async (lfgProfile, lfgGame) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: lfgProfile.id,
			lfg_game_id: lfgGame.id,
			type: LFG_EVENTS.game_create.name,
			points: LFG_EVENTS.game_create.points,
			detail: 'game created',
			is_addressed: true,
			admin_note: null,
			report_user_id: null,
			admin_user_id: null,
		});

		console.log(`LFG Event: ${lfgEvent.type} created!`);
		return lfgEvent;
	},

	participateEvent: async (lfgProfile, lfgGame) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: lfgProfile.id,
			lfg_game_id: lfgGame.id,
			type: LFG_EVENTS.participation.name,
			points: LFG_EVENTS.participation.points,
			detail: 'participating on game',
			is_addressed: true,
			admin_note: null,
			report_user_id: null,
			admin_user_id: null,
		});
		console.log(`LFG Event: ${lfgEvent.type} created!`);
		return lfgEvent;
	},

	leaveEvent: async (lfgProfile, lfgGame) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: lfgProfile.id,
			lfg_game_id: lfgGame.id,
			type: LFG_EVENTS.leaving.name,
			points: LFG_EVENTS.leaving.points,
			detail: 'leaving game',
			is_addressed: true,
			admin_note: null,
			report_user_id: null,
			admin_user_id: null,
		});
		console.log(`LFG Event: ${lfgEvent.type} created!`);
		return lfgEvent;
	},

	missEvent: async (issuerId, targetProfile, lfgGame, detail, options) => {
		// if there's already a miss event for this game and target, dont create
		const missEvent = await LFGEvent.findOne({
			where: {
				lfg_profile_id: targetProfile.id,
				lfg_game_id: lfgGame.id,
				type: LFG_EVENTS.miss.name,
			},
		});
		if (missEvent) {
			return null;
		}

		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: options.hasLfgProfile ? (await lfgProfileManager.getProfile(issuerId)).id : null,
			lfg_game_id: lfgGame.id,
			type: LFG_EVENTS.miss.name,
			points: LFG_EVENTS.miss.points,
			detail,
			is_addressed: true,
			admin_note: null,
			report_user_id: targetProfile.id,
			admin_user_id: options.isAdmin ? issuerId : null,
		});

		console.log(`LFG Event: ${lfgEvent.type} created!:\n ${lfgEvent}`);
		return lfgEvent;
	},

	reportEvent: async (issuerId, targetProfile, lfgGame, detail, options) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: options.hasLfgProfile ? (await lfgProfileManager.getProfile(issuerId)).id : null,
			lfg_game_id: options.hasLfgGame ? lfgGame.id : null,
			type: LFG_EVENTS.report.name,
			points: LFG_EVENTS.report.points,
			detail,
			is_addressed: false,
			admin_note: null,
			report_user_id: targetProfile.user_id,
			admin_user_id: options.isAdmin ? issuerId : null,
		});

		console.log(`LFG Event: ${lfgEvent.type} created!:\n ${lfgEvent}`);
		return lfgEvent;
	},

	getReportsDoneByUser: async (lfgProfile) => {
		const reports = await LFGEvent.findAll({
			where: {
				lfg_profile_id: lfgProfile.id,
				type: LFG_EVENTS.report.name,
			},
			include: [{
				model: models.LFGGame,
				as: 'game',
			}],
		});
		return reports;
	},

	getReportsDoneToUser: async (lfgProfile) => {
		const reports = await LFGEvent.findAll({
			where: {
				report_user_id: lfgProfile.user_id,
				type: LFG_EVENTS.report.name,
			},
			include: [
				{
					model: models.LFGGame,
					as: 'game',
				},
				{
					model: models.LFGProfile,
					as: 'lfgProfile',
				},
			],
		});
		return reports;
	},

	getEventById: async (id) => {
		const event = await LFGEvent.findOne({
			where: {
				id,
			},
		});
		return event;
	},

	resolveReport: async (report, points, notes, adminId) => {
		report.admin_user_id = adminId;
		report.admin_note = notes;
		report.points = points;
		report.is_addressed = true;
		await report.save();
		console.log(`LFG Event: ${report.type} resolved!`);
		return report;
	},
};