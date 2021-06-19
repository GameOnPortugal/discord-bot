const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

const MarketItem = require('./../../models/market/Item')(sequelize, Sequelize.DataTypes);

MarketItem.prototype.addItem = async function() {
	return MarketItem.create({
		name: 'test',
		price: '10.20',
		delivery_type: 'CTT',
		zone: 'Porto',
	});
};

module.exports.MarketItem = MarketItem;
