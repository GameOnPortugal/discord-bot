'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarketItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  MarketItem.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MarketItem',
  });
  return MarketItem;
};