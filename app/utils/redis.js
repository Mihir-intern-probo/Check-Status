const Redis = require('ioredis')
let client;
const connect=async ()=>{
    client = new Redis(
        6379,"3.110.253.71",{
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            connectTimeout: 10000
        }
    )
};

connect()
module.exports={client}