function lfgevent(name, points) {
	return { name, points };
}

module.exports = {
	/*
		These points need revising.
	*/
	LFG_EVENTS: {
		game_create: lfgevent('game_create', 20),
		game_cancel: lfgevent('game_cancel', -20),
		commendation: lfgevent('commendation', 5),
		ban: lfgevent('ban', 0),
		unban: lfgevent('unban', 0),
		participation: lfgevent('participation', 10),
		leaving: lfgevent('leaving', -10),
		miss: lfgevent('miss', -30),
		report: lfgevent('report', 0),
	},
};