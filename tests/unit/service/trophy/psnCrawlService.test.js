const PsnCrawlService = require('./../../../../src/service/trophy/psnCrawlService');

test('Extracts trophy percentage - old urls', async () => {
	expect.assertions(1);

	const data = await PsnCrawlService.getPlatTrophyPercentage('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYT');

	expect(data).toBeGreaterThan(1);
});

test('Extracts trophy percentage - new urls', async () => {
	expect.assertions(1);

	const data = await PsnCrawlService.getPlatTrophyPercentage('https://psnprofiles.com/trophies/11783-assassins-creed-valhalla/Josh_Lopes');

	expect(data).toBeGreaterThan(1);
});
