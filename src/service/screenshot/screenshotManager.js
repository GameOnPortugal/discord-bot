
const models = require('./../../models');
const Screenshot = models.Screenshot;

const crypto = require('crypto');
const https = require('https');
const dayjs = require('dayjs');
const weekday = require('dayjs/plugin/weekday');
dayjs.extend(weekday);

module.exports = {
	/**
     * Find screenshots created by an user
     *
     * @param {User} user
     *
     * @returns {Promise<Screenshot[]>}
     */
	findByUser: function(user) {
		return Screenshot.findAll({ where: { author_id: user.id } });
	},

	/**
     * Find screenshot by its ID
     *
     * @param {int} screenshotId
     *
     * @returns {Promise<Screenshot>|null}
     */
	findById: function(screenshotId) {
		return Screenshot.findOne({ where: { id: screenshotId } });
	},

	/**
     * Find screenshot by image md5 hash
     *
     * @param {string} md5
     *
     * @returns {Promise<Screenshot>|null}
     */
	findByMD5: function(md5) {
		return Screenshot.findOne({ where: { image_md5: md5 } });
	},

	/**
     * Grab the MD5 hash of an image
     *
     * @param {string} url
     *
     * @returns {Promise<string>}
     */
	generateMD5: function(url) {
		return new Promise(
			function(resolve, reject) {
				const hash = crypto.createHash('md5');
				https.get(url, function(response) {
					response.on('data', function(data) {
						hash.update(data);
					});
					response.on('end', function() {
						resolve(hash.digest('hex'));
					});
				}).on('error', function(error) {
					reject(error);
				});
			},
		);
	},

	/**
     * Delete screenshot from the dabatase and from the channel
     *
     * @param {Client} client
     * @param {int} screenshotId
     *
     * @returns {void}
     */
	delete: async function(client, screenshotId) {
		const screenshot = await this.findById(screenshotId);
		if (!screenshot) {
			throw new Error('Ad "' + screenshotId + '" not found!');
		}

		try {
			await client.channels.cache.get(screenshot.channel_id).messages.delete(screenshot.message_id);
		}
		catch (e) {
			// Ignore exceptions, e.g: the post is already removed
		}

		await Screenshot.destroy({ where: { id: screenshotId } });
	},

	/**
     * Create a new screenshot
     * @param {array} data
     *
     * @returns {Promise<Screenshot>}
     */
	create: async function(data) {
		return Screenshot.create(data);
	},

	findAllScreenshotsForThisWeek: function () {
		const today = dayjs();
		const lastMonday = today.weekday(-6);
		const lastSunday = today.weekday(0);

		return Screenshot.findAll({
			where: {
				createdAt: {
					[models.Sequelize.Op.between]: [
						lastMonday.format('YYYY-MM-DD 00:00:00'),
						lastSunday.format('YYYY-MM-DD 23:59:59'),
					]
				}
			}
		});
	}
};
