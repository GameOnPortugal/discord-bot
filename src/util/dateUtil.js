module.exports = {
	getMonthFromInput: function(input) {
		// input can be a number 1-12 or a string M/YYYY or MM/YYYY
		let month = null;
		let year = new Date().getFullYear();

		if (Number.isInteger(Number(input))) {
			month = Number(input - 1);
			return new Date(year, month);
		}
		if (input.length === 7 || input.length === 6) {
			const monthYear = input.split('/').map(Number);
			const date = new Date(monthYear[1], monthYear[0] - 1);
			if (date) {
				month = date.getMonth();
				year = date.getFullYear();
				return new Date(year, month);
			}
			else {
				throw new Error('Invalid month/year input');
			}
		}
		throw new Error('Invalid month/year input');
	},
};