const LfgProfileManager = require('../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../service/lfg/lfgEventManager');
const { getMonthFromInput } = require('../../util/dateUtil');

const Discord = require('discord.js');


module.exports = async function(message, args) {
	const rankType = args[1] ? args[1].toLowerCase() : 'monthly';

	if (rankType === 'lifetime') {
		const sortedLfgProfiles = await LfgProfileManager.getRankLifetime();
		let rankMessage = '';

		for (let i = 0; i < sortedLfgProfiles.length; i++) {
			rankMessage += `\`${i + 1}.\` <@${sortedLfgProfiles[i].user_id}> with **${sortedLfgProfiles[i].points}** points\n`;
		}

		rankMessage = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Top Lifetime LFG Profiles')
			.setDescription(rankMessage)
			.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
			.setTimestamp()
			.setFooter('|lfg rank lifetime', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

		message.channel.send(rankMessage);
		return;
	}
	if (rankType === 'monthly') {
		let month = new Date().getMonth();
		let year = new Date().getFullYear();
		if (args.length == 3) {
			try {
				const monthDate = getMonthFromInput(args[2]);
				month = monthDate.getMonth();
				year = monthDate.getFullYear();
			}
			catch (e) {
				message.reply('Data inválida.');
				return;
			}
		}

		const allProfiles = await LfgProfileManager.getAllValidProfiles();
		for (let i = 0; i < allProfiles.length; i++) {
			const profile = allProfiles[i];
			const points = await LfgEventManager.getPointsMonthly(profile, new Date(year, month, 1));
			profile.points = points;
		}

		const sortedLfgProfiles = allProfiles.sort((a, b) => b.points - a.points);
		let rankMessage = '';

		for (let i = 0; i < sortedLfgProfiles.length; i++) {
			rankMessage += `\`${i + 1}.\` <@${sortedLfgProfiles[i].user_id}> with **${sortedLfgProfiles[i].points}** points\n`;
		}

		rankMessage = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Top Monthly LFG Profiles')
			.setDescription(rankMessage)
			.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
			.setTimestamp()
			.setFooter('|lfg rank monthly', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

		message.channel.send(rankMessage);

		return;
	}

	message.reply('Comando inválido. Use `|lfg rank <lifetime|monthly [month]>`');
};