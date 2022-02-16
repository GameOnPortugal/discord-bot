class TrophyAlreadyClaimedException extends Error {
	constructor(message) {
		super(message);
		this.name = 'TrophyAlreadyClaimedException';
	}
}

module.exports = TrophyAlreadyClaimedException;
