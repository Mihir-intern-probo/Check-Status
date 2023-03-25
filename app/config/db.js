const dotenv = require('dotenv');
const {Sequelize} = require('sequelize');
dotenv.config();

try{
      const sequelize = new Sequelize(`btc_history`, `admin`, `master11`, {
            host: `likush-db1.cm6r8mlpzeac.ap-south-1.rds.amazonaws.com`,
            dialect: `mysql`,
            pool:{
                  max: 100,
                  min: 0,
                  acquire: 1000000,
                  idle: 10000
            },
            dialectOptions: {
                  connectTimeout: 1000000 
                }
       });
       sequelize.options.logging = false
       module.exports = sequelize;
} 
catch(err){
      console.log("Error: ", err)
}
