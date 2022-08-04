const LfgProfileManager = require('../../service/lfg/lfgProfileManager');
const LfgEventManager = require('../../service/lfg/lfgEventManager');

const PermissionsUtil = require('../../util/permissionsUtil');

const Discord = require('discord.js');

module.exports = async function(message, args) {
	if (args.length < 3) {
		message.reply('Comando inválido. Use `|lfg unban <user> <reason>`');
		return;
	}

	if (!PermissionsUtil.isAdmin(message.member) && process.env.NODE_ENV !== 'development') {
		message.reply('Apenas admins podem readmitir utilizadores.');
		return;
	}

	const user = message.mentions.users.first();
	const lfgProfile = await LfgProfileManager.getProfile(user.id);
	if (!lfgProfile) {
		message.reply('Este utilizador não tem perfil LFG.');
		return;
	}
	if (!lfgProfile.is_banned) {
		message.reply('Este utilizador não está banido.');
		return;
	}

	const reason = args.slice(2).join(' ');
	await LfgEventManager.unbanUser(message.author.id, lfgProfile, reason);
	await LfgProfileManager.unbanUser(lfgProfile);

	message.reply(`Utilizador <@${user.id}> foi readmitido no sistema LFG.`);

	// also send to channel #lfg-moderation 1003663012256825484
	const lfgModerationChannel = message.guild.channels.cache.get('1003663012256825484');
	if (lfgModerationChannel) {
		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('LFG User Unbanned')
			.setDescription(`<@${user.id}> foi readmitido no sistema LFG.`)
			.addField('Admin', `<@${message.author.id}>`)
			.addField('Motivo', reason)
			.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
			.setTimestamp()
			.setFooter('|lfg unban', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

		lfgModerationChannel.send(embed);
	}
};