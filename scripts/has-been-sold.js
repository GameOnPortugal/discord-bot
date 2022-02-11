// Sends a question to the user asking if they have already sold the item
const AdManager = require('../src/service/market/adManager');

const Discord = require('discord.js');
const client = new Discord.Client();

let guild = null;
let marketChannel = null;

async function askUser(ad, adMessage) {
	const dmChannel = await guild.members.fetch(ad.author_id).then(member => member.createDM());

	let sellMessage = ':moneybag: **VENDO**'
		+ `\n:arrow_right: **${ad.name}**`
		+ `\n:dollar: **Preço:** ${ad.price}`
		+ `\n:bust_in_silhouette: <@${ad.author_id}>`
		+ `\n\n**Zona:** ${ad.zone}`
		+ `\n**Estado:** ${ad.state}`
		+ `\n**Envio:** ${ad.dispatch}`
		+ `\n**Garantia:** ${ad.warranty}`
		+ (ad.description ? `\n\n${ad.description}` : '')
		+ '\n\n'+adMessage.url
	;

	const embed = new Discord.MessageEmbed()
		.setTitle(ad.adType === 'want' ? 'Ainda continuas a procura deste artigo?' : 'Este artigo já foi vendido?')
		.setDescription(sellMessage)
		.setColor('#0099ff')
		.setFooter('Por favor usa as reações para responder. Tens 1 dia para responder, na ausência de resposta iremos apagar o anúncio!')
		.setTimestamp();
	const msg = await dmChannel.send(embed);
	await msg.react('✅');
	await msg.react('❌');
	const filter = (reaction, user) => {
		return ['✅', '❌'].includes(reaction.emoji.name) && user.id === ad.author_id;
	};
	const dayInMilliseconds = 1000 * 60 * 60 * 24;

	await msg
		.awaitReactions(filter, { max: 1, time: dayInMilliseconds, errors: ["time"] })
		.then(async (collected) => {
			const reaction = collected.first();
			await msg.delete();
			if (reaction.emoji.name === '✅') {
				await AdManager.delete(client, ad.id)
					.then(async () => {
						await dmChannel.send('Obrigado! O anúncio foi apagado.');
					})
					.catch(async (err) => {
						console.log(err);
						await dmChannel.send('Ocorreu um erro ao apagar o teu anúncio! Por favor, tenta novamente.');
					});
			} else if (reaction.emoji.name === '❌') {
				await dmChannel.send('Obrigado! O anúncio não foi apagado.');
			}
		})
		.catch(async (err) => {
			console.log(err);
			await AdManager.delete(client, ad.id)
				.then(async () => {
					await dmChannel.send('A falta de resposta decidimos apagar o anúncio.');
				})
				.catch(err => {
					console.log(err);
				});
		})
	;
}


(async () => {
	await client.login(process.env.BOT_TOKEN);
	const GUILD_ID = '818108848492773377';
	guild = await client.guilds.fetch(GUILD_ID);

	if (!guild) {
		console.error('Guild not found');
		process.exit(1);
		return;
	}

	marketChannel = await client.channels.fetch('818447274266591243');
	if (!marketChannel) {
		console.log('Could not find market channel');
		process.exit(1);
		return;
	}

	const ads = await AdManager.findOldestAds();
	console.log('Found ' + ads.length + ' old ads. Asking users whether they are still interested.');
	for (let ad of ads) {
		const message = await marketChannel.messages.fetch(ad.message_id);
		if (!message) {
			console.error('Message not found');
			await AdManager.delete(client, ad.id);
			console.log('Deleting ad because message is missing...');

			continue;
		}

		await askUser(ad, message);
	}

	console.log('Done!');
	process.exit(0);
})();
