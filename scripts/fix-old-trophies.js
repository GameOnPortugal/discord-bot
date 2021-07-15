const DotEnv = require('dotenv');
DotEnv.config();

const PsnCrawlService = require('./../src/service/trophy/psnCrawlService');
const models = require('./../src/models');
const Trophies = models.Trophies;

async function FixTrophies() {
	const trophies = await Trophies.findAll({ where: { completionDate: null } });

	console.log('Found ' + trophies.length + ' trophies to fix...');

	for (const trophy of trophies) {
		console.log('Fixing trophy ' + trophy.id + ' - URL: ' + trophy.url + '...');

		const trophyData = await PsnCrawlService.getPlatTrophyData(trophy.url);
		const completionDateFormatted = trophyData.completionDate.format('YYYY-MM-DD');

		console.log(
			'Trophy Data:'
            + '\nPercentage:' + trophyData.percentage
            + '\nCompletion Date:' + completionDateFormatted,
		);

		await Trophies.update(
			{
				completionDate: trophyData.completionDate.format('YYYY-MM-DD'),
			},
			{
				where: { id: trophy.id },
			},
		);

		console.log('Updated...');
	}
}

FixTrophies().then(() => {
	console.log('Finished!');
});
