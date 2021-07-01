'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('MarketItems', 'state', { type: Sequelize.STRING });
		await queryInterface.addColumn('MarketItems', 'price', { type: Sequelize.STRING });
		await queryInterface.addColumn('MarketItems', 'zone', { type: Sequelize.STRING });
		await queryInterface.addColumn('MarketItems', 'dispatch', { type: Sequelize.STRING });
		await queryInterface.addColumn('MarketItems', 'warranty', { type: Sequelize.STRING });
		await queryInterface.addColumn('MarketItems', 'description', { type: Sequelize.TEXT });
		await queryInterface.addColumn('MarketItems', 'adType', { type: Sequelize.TEXT });
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('MarketItems', 'state');
		await queryInterface.removeColumn('MarketItems', 'price');
		await queryInterface.removeColumn('MarketItems', 'zone');
		await queryInterface.removeColumn('MarketItems', 'dispatch');
		await queryInterface.removeColumn('MarketItems', 'warranty');
		await queryInterface.removeColumn('MarketItems', 'description');
		await queryInterface.removeColumn('MarketItems', 'adType');
	},
};
