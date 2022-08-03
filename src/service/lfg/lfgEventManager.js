const { LFG_EVENTS } = require('../../enum/discord/lfgEventsEnum');
const models = require('../../models');
const lfgProfileManager = require('./lfgProfileManager');
const LFGEvent = models.LFGEvent;
const { Op } = require('sequelize');


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
			report_user_id: targetProfile.user_id,
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
			include: [
				{
					model: models.LFGProfile,
					as: 'lfgProfile',
				},
				{
					model: models.LFGGame,
					as: 'game',
				},
			],
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

	getCommendsLeft: async (lfgProfile) => {
		// number of commendations done on the last 7 days by the user
		const commendations = await LFGEvent.findAll({
			where: {
				lfg_profile_id: lfgProfile.id,
				type: LFG_EVENTS.commendation.name,
				createdAt: {
					[Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				},
			},
		});

		return 5 - commendations.length;
	},

	createCommend: async (userId, commendedUser, game, details, options) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: options.hasLfgProfile ? (await lfgProfileManager.getProfile(userId)).id : null,
			lfg_game_id: options.hasLfgGame ? game.id : null,
			type: LFG_EVENTS.commendation.name,
			points: LFG_EVENTS.commendation.points,
			detail: details,
			is_addressed: true,
			admin_note: null,
			report_user_id: commendedUser.user_id,
			admin_user_id: options.isAdmin ? userId : null,
		});

		console.log(`LFG Event: ${lfgEvent.type} created!:\n ${lfgEvent}`);
		return lfgEvent;
	},

	cancelEvent: async (lfgProfile, lfgGame, host, nearTime) => {
		const lfgEvent = await LFGEvent.create({
			lfg_profile_id: lfgProfile.id,
			lfg_game_id: lfgGame.id,
			type: LFG_EVENTS.game_cancel.name,
			points: LFG_EVENTS.game_cancel.points * (host ? nearTime ? 2 : 1 : 1),
			detail: 'canceled game',
			is_addressed: true,
			admin_note: null,
			report_user_id: null,
			admin_user_id: null,
		});
		console.log(`LFG Event: ${lfgEvent.type} created!`);
		return lfgEvent;
	},

	/**
	 * method to verify if a game has been canceled
	 */
	isGameCanceled: async (lfgGame) => {
		const events = await LFGEvent.findAll({
			where: {
				lfg_game_id: lfgGame.id,
				type: LFG_EVENTS.game_cancel.name,
			},
		});

		return events.length > 0;
	},
};