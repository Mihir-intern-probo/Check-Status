const express = require('express');
const app = express();
const dotenv = require('dotenv');
const sequelize = require('./app/config/db');
const routes = require('./app/routes');
app.use(express.json());
app.get('/health',(req,res)=>{
    res.send("Running")
})

app.use("/api", routes);
dotenv.config()

const PORT = process.env.PORT;
const dbConnection=async()=>{
    try {
        await sequelize.authenticate();
        sequelize.sync().then((result)=>{
            console.log('Connection has been established successfully.');
        }).catch((err)=>{
            console.log(err);
        })
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

app.get('/health',(req,res)=>{
    console.log("App is up and Running")
    res.send("App is up and Running")
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is running at 3000");
    dbConnection();
})
