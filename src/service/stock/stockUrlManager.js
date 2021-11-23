const models = require('./../../models');
const StockUrls = models.StockUrls;

const channelEnum = require('./../../enum/discord/channelEnum');
const rolesEnum = require('./../../enum/discord/rolesEnum');
const telegramChatEnum = require('./../../enum/telegram/chatEnum');

const TelegramBot = require('node-telegram-bot-api');

module.exports = {
	/**
	 * Find a profile by discord username
	 *
	 * @param {string} url
	 *
	 * @returns {TrophyProfile|null}
	 */
	findByUrl: async function(url) {
		return await StockUrls.findOne({ where: { url: url } });
	},

	/**
     * Create and link a discord user with a trophy profile
     *
     * @param {User} author
	 * @param {string} url
     *
     * @returns {StockUrls}
     */
	create: async function(author, url) {
		const stockUrl = await this.findByUrl(url);
		if (stockUrl) {
			throw new Error('That url already exists!');
		}

		return await StockUrls.create(
			{
				userId: author.id,
				url: url,
			},
		);
	},

	/**
	 * Send a notification for stock for some url
	 *
	 * @param message
	 * @param {StockUrls} stockUrl
	 */
	stockNotification: async function(message, stockUrl) {
		const bot = new TelegramBot(process.env.TELEGRAM_ACCESS_TOKEN);

		const notificationMessage = 'alertou para stock no site: ' + stockUrl.url;

		await bot.sendMessage(telegramChatEnum.ALERTAS_PRIME, notificationMessage);
		await message.client.channels.cache.get(channelEnum.PREMIUM_ALERT_CHAT).send('<@&' + rolesEnum.ALERTAS_PRIME + '> : <@' + message.author + '>' + notificationMessage);

		setTimeout(async function() {
			await message.client.channels.cache.get(channelEnum.FREE_ALERT_CHAT).send('@everyone : <@' + message.author + '>' + notificationMessage);
		}, 120000);
	},
};
