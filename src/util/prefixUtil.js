'use strict';

const Keyv = require('keyv');
const keyv = new Keyv(process.env.REDIS_DSN);

const PrefixUtil = {
	// Prefix that is used by default
	globalPrefix: '|',

	/**
     * Gets prefix to be used by bot
     *
     * @returns string
     */
	getPrefix: async function() {
		let currentPrefix = await keyv.get('prefix');
		if (!currentPrefix) {
			currentPrefix = this.globalPrefix;
		}

		return currentPrefix;
	},

	/**
     * Set prefix for the GUILD
     *
     * @param {String} prefix
     *
     * @returns {Promise<void>}
     */
	setPrefix: async function(prefix) {
		await keyv.set('prefix', prefix);
	},
};

module.exports = PrefixUtil;
