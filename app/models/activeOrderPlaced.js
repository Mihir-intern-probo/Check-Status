const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const activeOrdersPlaced =   sequelize.define('active_orders_placed', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,  
    primaryKey: true
  },
  transactionId:{
    type: DataTypes.STRING,
    allowNull: false
  },
  eventId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderId:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  entry_price:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  offer_type:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_type:{
    type: DataTypes.STRING,
    allowNull: false
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
  }
});
module.exports = {activeOrdersPlaced}