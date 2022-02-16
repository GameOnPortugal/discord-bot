// Attempt to grab PSN Ranks, if they are not available means that the account is probably banned!
const PsnCrawlService = require('./../src/service/trophy/psnCrawlService');
const TrophyProfileManager = require('./../src/service/trophy/trophyProfileManager');
const TrophiesManager = require('./../src/service/trophy/trophyManager');
const Discord = require('discord.js');
const client = new Discord.Client();

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.TROPHY_WEBHOOK);

const argv = require('minimist')(process.argv.slice(2));
const parseAll = Object.prototype.hasOwnProperty.call(argv, 'all');
const profile = Object.prototype.hasOwnProperty.call(argv, 'profile') ? argv.profile : null;
if (parseAll && !profile) {
	console.log('You must specify a profile to parse all profiles!');
	process.exit(1);
}

if (parseAll) {
	console.log('Parsing all trophies of profile:' + profile);
}

async function createTrophies(trophyProfile, urls) {
	for (const trophyUrl of urls) {
		let trophy = await TrophiesManager.findByUsernameAndUrl(trophyProfile, trophyUrl);
		if (trophy && !parseAll) {
			console.log('[' + trophyProfile.psnProfile + '] Trophy ' + trophyUrl + ' is already submitted!');
			console.log('[' + trophyProfile.psnProfile + '] Stopping going through the urls as i think I\'ve catched up');

			// Return false to let other scripts now we won't be parsing anything else
			return false;
		}

		try {
			const trophyData = await PsnCrawlService.getPlatTrophyData(trophyUrl);
			trophy = await TrophiesManager.create(trophyProfile, trophyUrl, trophyData);
		}
		catch (exception) {
			console.error(exception);

			continue;
		}

		console.log('[' + trophyProfile.psnProfile + '] Trophy created successfully. Sending webhook!');

		await hook.send('Parabéns <@' + trophyProfile.userId + '>! Acabaste de receber ' + trophy.points + ' TP (Trophy Points) pelo teu troféu: ' + trophyUrl);
	}
}

(async () => {
	await client.login(process.env.BOT_TOKEN);
	const GUILD_ID = '818108848492773377';
	const guild = await client.guilds.fetch(GUILD_ID);

	const trophyProfiles = await TrophyProfileManager.findAllNonExcluded();

	console.log('Parsing and updating ' + trophyProfiles.length + ' profiles');

	for (const trophyProfile of trophyProfiles) {
		if (profile && trophyProfile.psnProfile !== profile) {
			console.log('Skipping profile ' + trophyProfile.psnProfile + ' as it is not the profile we are looking for');
			continue;
		}

		console.log('[' + trophyProfile.psnProfile + '] Parsing profile');

		const profileRank = await PsnCrawlService.getProfileRank(trophyProfile.psnProfile);
		if (!trophyProfile.isBanned && (profileRank.worldRank === null || profileRank.countryRank === null)) {
			console.log('[' + trophyProfile.psnProfile + '] Profile is banned on PSN Profile. Flag as banned!');
			await TrophyProfileManager.flagAsBanned(trophyProfile);
			await TrophyProfileManager.flagAsExcluded(trophyProfile);

			continue;
		}

		let user = null;
		try {
			user = await guild.members.fetch(trophyProfile.userId);
		}
		catch (exception) {
			if (exception.code === 10007) {
				// Unknown member code
				console.log('[' + trophyProfile.psnProfile + '] Has left the server. Flag as leaver!');
				await TrophyProfileManager.flagAsLeaver(trophyProfile);
				await TrophyProfileManager.flagAsExcluded(trophyProfile);

				continue;
			}

			console.error(exception);
		}

		if (!user) {
			console.log('[' + trophyProfile.psnProfile + '] Problem finding the user (#' + trophyProfile.userId + ') on the server! Skipping..');
			continue;
		}

		console.log('[' + trophyProfile.psnProfile + '] Found the user! Trying to grab the urls!');

		let page = 1;
		let urls = await PsnCrawlService.getProfileTrophies(trophyProfile.psnProfile, page);
		if (urls.length === 0) {
			console.log('[' + trophyProfile.psnProfile + '] URLs not found for this profile!');
		}

		while (urls.length > 0) {
			console.log('[' + trophyProfile.psnProfile + '] Found ' + urls.length + ' trophy urls for page num ' + page);
			if (!await createTrophies(trophyProfile, urls)) {
				break;
			}
			page++;
			urls = await PsnCrawlService.getProfileTrophies(trophyProfile.psnProfile, page);
		}

		console.log('[' + trophyProfile.psnProfile + '] Finished parsing profile!');
	}

	console.log('Parsing has ended for all profiles!');

	process.exit(0);
})();
