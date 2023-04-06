const { Sequelize, Model, DataTypes, ConnectionRefusedError } = require('sequelize');
const sequelize = require('../config/db');

const TestingResponse =   sequelize.define('testing_response', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,  
    primaryKey: true,
  },
  order_type:{
    type:DataTypes.STRING,
    allowNull: true
  },
  transaction_id:{
    type: DataTypes.STRING,
    allowNull:true
  },
  event_id:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  BAP:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true,
  },
  Exit_Price:{
    type: DataTypes.FLOAT(10,2),
    allowNull: true
  },
  profit:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  trade_place_time:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  trigger_value:{
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
});
module.exports = {TestingResponse}