// Sends a question to the user asking if they have already sold the item
const AdManager = require('../src/service/market/adManager');

const Discord = require('discord.js');
const client = new Discord.Client();

let guild = null;
let marketChannel = null;
const threeHoursInMilliseconds = 10800000;
const oneHourInMilliseconds = 3600000;

async function askUser(ad, adMessage) {
	console.log('Asking user ' + ad.author_id + ' if they have already sold the item ' + ad.name);

	let dmChannel = null;
	try {
		dmChannel = await guild.members.fetch(ad.author_id).then(member => member.createDM());
	}
	catch (error) {
		console.log(error);
		console.error('Could not send DM to user ' + ad.author_id + ' deleting AD to prevent further problems down the lane!');
		await AdManager.delete(client, ad.id);
		return;
	}

	const sellMessage = (ad.adType === 'wanted' ? ':mag: **PROCURO**' : ':moneybag: **VENDO**')
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
		.setTitle(ad.adType === 'wanted' ? 'Ainda continuas a procura deste artigo?' : 'Este artigo já foi vendido?')
		.setDescription(sellMessage + '\n\n' + adMessage.url)
		.setColor('#0099ff')
		.setFooter('Por favor usa as reações para responder. Tens 3 horas para responder, na ausência de resposta iremos apagar o anúncio!')
		.setTimestamp();
	let msg = null;
	try {
		msg = await dmChannel.send(embed);
	}
	catch (error) {
		console.log(error);
		console.error('Could not send DM to user ' + ad.author_id + ' deleting AD to prevent further problems down the lane!');
		await AdManager.delete(client, ad.id);
		return;
	}
	await msg.react('✅');
	await msg.react('❌');
	const filter = (reaction, user) => {
		return ['✅', '❌'].includes(reaction.emoji.name) && user.id === ad.author_id;
	};

	await msg
		.awaitReactions(filter, { max: 1, time: threeHoursInMilliseconds, errors: ['time'] })
		.then(async (collected) => {
			const reaction = collected.first();
			await msg.delete();

			console.log('Got an reaction from user ' + ad.author_id + ' with emoji ' + reaction.emoji.name);

			const deleteMessage = (
				// Approved, sold already happened
				(reaction.emoji.name === '✅' && ad.adType === 'sell')
				// Refused, no longer wanted
				|| (reaction.emoji.name === '❌' && ad.adType === 'wanted')
			);
			const renewMessage = (
				// Refused, item still not sold
				(reaction.emoji.name === '❌' && ad.adType === 'sell')
				// Accepted, still looking for this item
				|| (reaction.emoji.name === '✅' && ad.adType === 'wanted')
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

			const moreUserAds = await AdManager.findOldestAdsByUser(ad.author_id);
			if (moreUserAds.length) {
				console.log('Found more ads by user ' + ad.author_id + ' gonna try and resolve this as well...');
				for (const moreUserAd of moreUserAds) {
					const originalMessage = await getOriginalAdMessage(moreUserAd);
					if (!originalMessage) {
						continue;
					}

					await askUser(moreUserAd, originalMessage);
				}
			}
			else {
				console.log('This user ' + ad.author_id + ' doesn\'t have more items in the market');
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


/**
 * Look for the original discord message for the ad
 * If the message doesn't exist attempt to delete it and send null instead
 */
async function getOriginalAdMessage(ad) {
	let message = null;
	try {
		message = await marketChannel.messages.fetch(ad.message_id);
	}
	catch (error) {
		message = null;
		console.error(error);
	}
	if (!message) {
		console.error('Message not found. Deleting the ad to prevent further problems...');
		try {
			await AdManager.delete(client, ad.id);
		}
		catch (error) {
			console.error(error);
		}
	}

	return message;
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

	for (;;) {
		const ads = await AdManager.findOldestAds();
		if (ads.length === 0) {
			console.log('No more ads to refresh... sleep for 1 hour');
			await new Promise(resolve => setTimeout(resolve, oneHourInMilliseconds));
			continue;
		}

		console.log('Found ' + ads.length + ' old ads. Asking users whether they are still interested.');
		await Promise.all(ads.map(async (ad) => {
			const message = await getOriginalAdMessage(ad);
			if (!message) {
				return;
			}

			await askUser(ad, message);
		}));
	}
})();
