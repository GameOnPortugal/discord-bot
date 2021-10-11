// Attempt to grab PSN Ranks, if they are not available means that the account is probably banned!
const PsnCrawlService = require('./../src/service/trophy/psnCrawlService');
const TrophyProfileManager = require('./../src/service/trophy/trophyProfileManager');
const TrophiesManager = require('./../src/service/trophy/trophyManager');

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.TROPHY_WEBHOOK);

async function createTrophies(trophyProfile, urls) {
	for (const trophyUrl of urls) {
		let trophy = await TrophiesManager.findByUsernameAndUrl(trophyProfile, trophyUrl);
		if (trophy) {
			console.log('Trophy ' + trophyUrl + ' is already submitted!');
			console.log('Stopping going through the urls as i think I\'ve catched up');

			return;
		}

		try {
			const trophyData = await PsnCrawlService.getPlatTrophyData(trophyUrl);
			trophy = await TrophiesManager.create(trophyProfile, trophyUrl, trophyData);
		}
		catch (exception) {
			console.error(exception);

			continue;
		}

		console.log('Trophy created successfully. Sending webhook!');

		hook.send('Parabéns <@' + trophyProfile.userId + '>! Acabaste de receber ' + trophy.points + ' TP (Trophy Points) pelo teu troféu: ' + trophyUrl);
	}
}

(async () => {
	const trophyProfiles = await TrophyProfileManager.findAll();

	console.log('Parsing and updating ' + trophyProfiles.length + ' profiles');

	for (const trophyProfile of trophyProfiles) {
		console.log(' >>> Parsing profile ' + trophyProfile.psnProfile + ' >>>>');

		const profileRank = await PsnCrawlService.getProfileRank(trophyProfile.psnProfile);
		if (profileRank.worldRank === null || profileRank.countryRank === null) {
			console.log('Profile ' + trophyProfile.psnProfile + ' is banned. Flag as banned!');
			await TrophyProfileManager.flagAsBanned(trophyProfile);

			continue;
		}

		const urls = await PsnCrawlService.getProfileTrophies(trophyProfile.psnProfile);
		console.log('Found ' + urls.length + ' trophy urls for this profile.');

		await createTrophies(trophyProfile, urls);

		console.log(' <<< Job ended <<<<');
	}
})();