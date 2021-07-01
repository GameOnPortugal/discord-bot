const models = require('./../../models');
const MarketItem = models.MarketItem;

module.exports = {
	name: 'add',
	guildOnly: true,
	description: 'Add a new market item',
	execute(message) {
		MarketItem
			.create({
				name: 'Test',
				state: 'New',
				price: '10.0',
				delivery_type: 'ctt',
				zone: 'Porto',
			})
			.then(function() {
				message.channel.send('Item created.');
			})
			.catch(function(error) {
				console.log(error);
				message.channel.send('Error while creating the item.');
			});
	},
};
