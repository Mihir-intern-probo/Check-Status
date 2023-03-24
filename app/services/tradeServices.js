const { Worker } = require('worker_threads');

const placeOrders = async() => {
    try{
        return new Promise((resolve,reject)=>{
            const worker = new Worker('./app/workers/placeOrders.js');
            worker.on('message',(data)=>{
                resolve(data);
            })
            worker.on('error',(data)=>{
                reject(data);
            })
            worker.on('exit',(code)=>{
                if(code!=0){
                    reject(new Error(`Worker file stopped working with code ${code}`))
                }
            })
        })
    }catch(err){
        console.log(err);
    }
}
    const tradeServices = {
        statisticalTradePlacement: async(req,res)=>{
            try{
                await placeOrders();
            }catch(err){
                console.log("Error found", err);
                res.send("Error detected", err);
            }
        },
    }


module.exports = {tradeServices}   
