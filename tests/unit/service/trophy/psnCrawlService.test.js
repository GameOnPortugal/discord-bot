const PsnCrawlService = require('./../../../../src/service/trophy/psnCrawlService');

test('Extracts trophy percentage', async () => {
	expect.assertions(1);

	const data = await PsnCrawlService.getPlatTrophyPercentage('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYT');

	expect(data).toBe(55.02);
});
