const { LFG_EVENTS } = require('../../enum/discord/lfgEventsEnum');
const models = require('../../models');
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

};