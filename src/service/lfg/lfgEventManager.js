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

};