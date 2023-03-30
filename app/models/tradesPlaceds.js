const {  DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TradesPlaced =   sequelize.define('trades_placed', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,  
    primaryKey: true
  },
  transactionId:{
    type: DataTypes.STRING,
    allowNull: false
  },
  order_id:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_price:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  exit_price:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  offer_type:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_type:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  profit:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true,
  },
  status:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt:{
    type: DataTypes.DATE,
    allowNull: true
  },
  tradePlacedAt:{
    type: DataTypes.DATE,
    allowNull: true
  }
});
module.exports = {TradesPlaced}