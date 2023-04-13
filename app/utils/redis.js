const Redis = require('ioredis')
let client;
const connect=async ()=>{
    client = new Redis(
        6379,"172.31.44.131",{
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            connectTimeout: 10000,
	    password: "dfe57b78ab9e2165281e373bd3520bc7"
        }
    )
};

connect()
module.exports={client}
