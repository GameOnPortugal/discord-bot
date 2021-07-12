const PrefixUtil = require('./../../../util/prefixUtil');

const MessageValidatorOnlyCommands = {
    /**
     * Handles restriction/message
     *
     * @param restriction
     * @param message
     * @returns {Promise<boolean>}
     */
    handle: async function(restriction, message) {
        console.log('Only commands.', restriction.data);

        const allowedCommands = restriction.data.split(',');
        const prefix = await PrefixUtil.getPrefix();

        if (!message.content.startsWith(prefix) && !message.mentions.has(message.client.user)) {
            console.log('Message sent is not a command!');

            // TODO: this should come from other place but to reduce the amount of messages
            // we receive with WTF happened it stays here..
            await message.author.send('Apenas os seguintes comandos são permitidos: **'+prefix+allowedCommands.join('**, **'+prefix)+'**');

            return false;
        }

        let args = message.content;
        if (message.content.startsWith(prefix)) {
            // remove the prefix from command and split arguments by spaces
            args = args.slice(prefix.length).trim().split(/ +/);
        }
        else {
            // split arguments by spaces
            args = args.trim().split(/ +/);

            // remove the bot name (e.g.: @PSPT-bot)
            args.shift();

            if (args.length === 0) {
                console.log('Command by bot name used. But no command sent.');

                return false;
            }
        }

        // Grab the command
        const commandUsed = args.shift();

        // Validate the command against the commands allowed
        for (const command of allowedCommands) {
            if (command === commandUsed) {
                return true;
            }
        }

        // TODO: this should come from other place but to reduce the amount of messages
        // we receive with WTF happened it stays here..
        await message.author.send('Apenas os seguintes comandos são permitidos: **'+prefix+allowedCommands.join('**, **'+prefix)+'**');

        return false;
    },
};

module.exports = MessageValidatorOnlyCommands;
