const MessageValidatorRegex = {
	/**
     * Handles restriction/message
     *
     * @param restriction
     * @param message
     * @returns {Promise<boolean>}
     */
	handle: async function(restriction, message) {
		const regex = new RegExp(restriction.data);

		console.log('Testing message matches regex "' + restriction.data + '"');

		return regex.test(message.content);
	},
};

module.exports = MessageValidatorRegex;
