const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
	/**
     * Attempts to crawl the page, parse the trophy list and grab percentage from psn
     *
     * @param {string} trophyUrl
     *
     * @returns {float|null}
     */
	getPlatTrophyPercentage: async function(trophyUrl) {
		return await JSDOM.fromURL(trophyUrl).then(dom => {
			const $ = require('jquery')(dom.window);

			const $trophyTableBody = $('#content > div.row > div.col-xs > div.box.no-top-border > table > tbody');
			if (!$trophyTableBody.length) {
				throw new Error('Couldn\'t find trophy table body!');
			}

			// Has it been completed?
			const $platTrophyRow = $trophyTableBody.find('tr:first');
			if (!$platTrophyRow.hasClass('completed')) {
				console.log('User hasn\'t earned the plat trophy yet!');

				return null;
			}

			// Plat percentage e.g.: 52.03%
			const psnPlatPercentage = $platTrophyRow.find('td.hover-hide span.typo-top').html();
			if (psnPlatPercentage.trim().length) {
				return parseFloat(psnPlatPercentage);
			}

			return null;
		});
	},
};
