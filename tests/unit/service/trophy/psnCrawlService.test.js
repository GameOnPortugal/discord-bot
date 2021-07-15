const PsnCrawlService = require('./../../../../src/service/trophy/psnCrawlService');

test('Extracts trophy data - old urls', async () => {
	expect.assertions(2);

	const data = await PsnCrawlService.getPlatTrophyData('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYT');

	expect(data.percentage).toBeGreaterThan(1);
	expect(data.completionDate.format('YYYY-MM-DD')).toBe('2021-06-29');
});

test('Extracts trophy percentage - new urls', async () => {
	expect.assertions(2);

	const data = await PsnCrawlService.getPlatTrophyData('https://psnprofiles.com/trophies/11783-assassins-creed-valhalla/Josh_Lopes');

	expect(data.percentage).toBeGreaterThan(1);
	expect(data.completionDate.format('YYYY-MM-DD')).toBe('2021-03-09');
});
