// Sends a question to the user asking if they have already sold the item
const AdManager = require('../src/service/market/adManager');

const Discord = require('discord.js');
const client = new Discord.Client();

let guild = null;
let marketChannel = null;

async function askUser(ad, adMessage) {
	const dmChannel = await guild.members.fetch(ad.author_id).then(member => member.createDM());

	const sellMessage = ':moneybag: **VENDO**'
		+ `\n:arrow_right: **${ad.name}**`
		+ `\n:dollar: **Preço:** ${ad.price}`
		+ `\n:bust_in_silhouette: <@${ad.author_id}>`
		+ `\n\n**Zona:** ${ad.zone}`
		+ `\n**Estado:** ${ad.state}`
		+ `\n**Envio:** ${ad.dispatch}`
		+ `\n**Garantia:** ${ad.warranty}`
		+ (ad.description ? `\n\n${ad.description}` : '')
	;

	const embed = new Discord.MessageEmbed()
		.setTitle(ad.adType === 'want' ? 'Ainda continuas a procura deste artigo?' : 'Este artigo já foi vendido?')
		.setDescription(sellMessage + '\n\n' + adMessage.url)
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
		.awaitReactions(filter, { max: 1, time: dayInMilliseconds, errors: ['time'] })
		.then(async (collected) => {
			const reaction = collected.first();
			await msg.delete();
			const deleteMessage = (
				// Approved, sold already happened
				reaction.emoji.name === '✅' && ad.adType === 'sell'
				// Refused, no longer wanted
				|| reaction.emoji.name === '❌' && ad.adType === 'want'
			);
			const renewMessage = (
				// Refused, item still not sold
				reaction.emoji.name === '❌' && ad.adType === 'sell'
				// Accepted, still looking for this item
				|| reaction.emoji.name === '✅' && ad.adType === 'want'
			);

			if (deleteMessage) {
				await AdManager.delete(client, ad.id)
					.then(async () => {
						await dmChannel.send('Obrigado! O anúncio foi apagado.');
					})
					.catch(async (err) => {
						console.log(err);
						await dmChannel.send('Ocorreu um erro ao apagar o teu anúncio! Por favor, tenta novamente.');
					});
			}
			else if (renewMessage) {
				const newMessage = await marketChannel.send(sellMessage);
				const newAdData = {
					'name': ad.name,
					'author_id': ad.author_id,
					'channel_id': ad.channel_id,
					'message_id': newMessage.id,
					'state': ad.state,
					'price': ad.price,
					'zone': ad.zone,
					'dispatch': ad.dispatch,
					'warranty': ad.warranty,
					'description': ad.description,
					'adType': ad.adType,
				};
				await AdManager.create(newAdData);
				await AdManager.delete(client, ad.id);

				await dmChannel.send('Obrigado! O teu anúncio foi renovado!');
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
	for (const ad of ads) {
		const message = await marketChannel.messages.fetch(ad.message_id);
		if (!message) {
			console.error('Message not found. Deleting the ad to prevent further problems...');
			await AdManager.delete(client, ad.id);

			continue;
		}

		await askUser(ad, message);
	}

	console.log('Done!');
	process.exit(0);
})();
