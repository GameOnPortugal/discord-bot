const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * PSN profile dates look like: 29th Jun 2021
 *
 * @link https://day.js.org/docs/en/parse/string-format
 *
 * @type {string}
 */
const psnProfileDateFormat = 'Do MMM YYYY';

module.exports = {
	/**
     * Attempts to parse trophy page, grab trophy and it's completion date
     *
     * @param {string} trophyUrl
     *
     * @returns {Object<float, dayjs>|null}
     */
	getPlatTrophyData: async function(trophyUrl) {
		return await JSDOM.fromURL(trophyUrl).then(dom => {
			const $ = require('jquery')(dom.window);

			const $trophyTableBody = $('#content > div.row > div.col-xs > div.box.no-top-border:first > table:last > tbody');
			if (!$trophyTableBody.length) {
				throw new Error('Couldn\'t find trophy table body!');
			}

			// Has it been completed?
			let $platTrophyRow = $trophyTableBody.find('tr:first');

			// HACK: some trophy pages in psn profiles have blank rows in the first position...
			// jump to the second one if that's the case
			if ($platTrophyRow.html() === '') {
				$platTrophyRow = $trophyTableBody.find('tr:eq(1)');
			}

			if (!$platTrophyRow.hasClass('completed')) {
				throw new Error('User hasn\'t earned the plat trophy yet!');
			}

			// Plat percentage e.g.: 52.03%
			const $psnPlatPercentage = $platTrophyRow.find('td.hover-hide span.typo-top');
			if (!$psnPlatPercentage.length || !$psnPlatPercentage.html().trim().length) {
				throw new Error('Couldn\'t find trophy percentage!');
			}

			const platPercentage = parseFloat($psnPlatPercentage.html().trim());

			// Completion date e.g.: 29th Jun 2021
			const $completionDate = $platTrophyRow.find('td span.typo-top-date');
			if (!$completionDate.length || !$completionDate.html().trim().length) {
				throw new Error('Couldn\'t find completion date!');
			}

			const completionDate = dayjs($completionDate.text().trim(), psnProfileDateFormat);
			if (!completionDate.isValid()) {
				throw new Error('Completion date "' + $completionDate.text().trim() + '" is invalid!');
			}

			return {
				percentage: platPercentage,
				completionDate: completionDate,
			};
		});
	},

	/**
	 * Checks whether or not a psn profile is banned
	 *
	 * @param {string} psnProfileUsername
	 *
	 * @returns bool
	 */
	getProfileRank: async function(psnProfileUsername) {
		return await JSDOM.fromURL('https://psnprofiles.com/' + psnProfileUsername).then(dom => {
			const $ = require('jquery')(dom.window);

			const $worldRank = $('div.stats > span.rank');
			const $countryRank = $('div.stats > span.country-rank');

			console.log($worldRank, $countryRank);

			return {
				worldRank: $worldRank.length ? parseInt($worldRank.text().replaceAll(',', '')) : null,
				countryRank: $countryRank.length ? parseInt($countryRank.text().replaceAll(',', '')) : null,
			};
		});
	},

	/**
	 * Return all profile plats
	 *
	 * @param {string} psnProfileUsername
	 *
	 * @returns {string[]}
	 */
	getProfileTrophies: async function(psnProfileUsername) {
		const urls = [];
		let consumeUrls = true;
		let page = 1;

		while(consumeUrls) {
			await JSDOM.fromURL('https://psnprofiles.com/' + psnProfileUsername + '?completion=platinum&order=last-played&pf=all&page=' + page).then(dom => {
				const $ = require('jquery')(dom.window);
				const $platinumRows = $('table#gamesTable tr.platinum');
				if (!$platinumRows.length) {
					// No more plats in this page
					consumeUrls = false;

					return;
				}

				$platinumRows.each(function(idx, element) {
					const $row = $(element);
					urls.push('https://psnprofiles.com' + $row.find('a:first').attr('href'));
				});
			});

			page++;
		}

		return urls;
	},
};
