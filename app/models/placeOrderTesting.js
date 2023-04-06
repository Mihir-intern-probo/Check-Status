const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const placeTradesForTesting =   sequelize.define('place_tades_for_testings', {
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
  entry_price:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  order_type:{
    type: DataTypes.STRING,
    allowNull: false
  },
  trigger_value: {
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  status:{
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt:{
    type: DataTypes.DATE,
    allowNull: true
  }
},{
  tableName:'place_tades_for_testings',
  indexes:[{
    name: 'trigger_idx',
    fields:['transactionId']
  }]
});
module.exports = {placeTradesForTesting}