const PsnCrawlService = require('./../../../../src/service/trophy/psnCrawlService');

test('Extracts trophy data - old urls', async () => {
	expect.assertions(1);

	try {
		await PsnCrawlService.getPlatTrophyData('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYT');
	}
	catch (e) {
		expect(e.message).toEqual('User hasn\'t earned the plat trophy yet!');
	}

	// expect(data.percentage).toBeGreaterThan(1);
	// expect(data.completionDate.format('YYYY-MM-DD')).toBe('2021-06-29');
});

test('Extracts trophy percentage - new urls', async () => {
	expect.assertions(2);

	const data = await PsnCrawlService.getPlatTrophyData('https://psnprofiles.com/trophies/11783-assassins-creed-valhalla/Josh_Lopes');

	expect(data.percentage).toBeGreaterThan(1);
	expect(data.completionDate.format('YYYY-MM-DD')).toBe('2021-03-09');
});

test('Grabs the current ranks from a psn profile', async () => {
	expect.assertions(4);

	const ranks = await PsnCrawlService.getProfileRank('Josh_Lopes');

	expect(ranks.worldRank).toBeGreaterThan(1);
	expect(ranks.countryRank).toBeGreaterThan(1);

	// Banned account
	const ranks2 = await PsnCrawlService.getProfileRank('oneeye_japan');

	expect(ranks2.worldRank).toBeNull();
	expect(ranks2.countryRank).toBeNull();
});
