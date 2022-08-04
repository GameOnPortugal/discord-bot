const Discord = require('discord.js');

module.exports = {
	buildReportEmbed: function(report, userId) {
		const embed = new Discord.MessageEmbed()
			.setTitle('LFG Report')
			.setDescription(`${report.detail}`)
			.setColor(report.is_addressed ? '#00ff00' : '#0000ff')
			.addField('Reportado', `<@${report.report_user_id}>`, true)
			.addField('Reportado Por', `<@${userId}>`, true)
			.addField('Status', report.is_addressed ? 'Resolvido' : 'Aberto', true)
			.addField('ID', report.id, true)
			.setTimestamp(report.createdAt)
			.setThumbnail('https://i.ibb.co/LzHsvdn/Transparent-2.png')
			.setFooter('|lfg reports', 'https://i.ibb.co/LzHsvdn/Transparent-2.png');

		if (report.lfg_game_id) {
			embed.addField('Jogo', `${report.game.game} (${report.game.id})`, true);
		}

		if (report.is_addressed) {
			embed.addField('Pontos', report.points);
			embed.addField('Admin', report.admin_user_id ? `<@${report.admin_user_id}>` : 'N/A');
			embed.addField('Notas Admin', report.admin_note ? report.admin_note : 'N/A');
		}


		return embed;
	},
};