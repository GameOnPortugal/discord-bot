'use strict';

module.exports = {
	/**
     * Get user from a mention string, e.g.: <@!823869192137998356>
     *
     * @param {Client} client
     * @param {string} mention
     *
     * @returns {Promise<User>>}
     */
	getMessageMention: async function(client, mention) {
		if (!mention) return;

		if (mention.startsWith('<@') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			}

			return client.users.cache.get(mention);
		}
	},
};
