function lfgevent(name, points) {
	return { name, points };
}

module.exports = {
	/*
		These points need revising.
	*/
	LFG_EVENTS: {
		game_create: lfgevent('game_create', 10),
		game_cancel: lfgevent('game_cancel', -10),
		commendation: lfgevent('commendation', 10),
		ban: lfgevent('ban', 0),
		unban: lfgevent('unban', 0),
		participation: lfgevent('participation', 10),
		leaving: lfgevent('leaving', -10),
		miss: lfgevent('miss', -10),
		report: lfgevent('report', 0),
	},
};