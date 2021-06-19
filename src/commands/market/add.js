const models = require('./../../models');
const MarketItem = models.MarketItem;

module.exports = {
	name: 'add',
	description: 'Add a new market item',
	execute(message) {
		MarketItem.create({
			name: 'Test',
			state: 'New',
			price: '10.0',
			delivery_type: 'ctt',
			zone: 'Porto',
		});

		message.channel.send('Item created.');
	},
};
