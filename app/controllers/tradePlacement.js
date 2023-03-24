const {tradeServices} = require('../services/tradeServices')

const tradeController={

    placeTrades: async(req,res)=>{
        try{
            // CHECL FOR AUTHENTICATION
            const info = tradeServices.statisticalTradePlacement(res,req);
	    console.log("Started Checking Orders");
            res.status(200).json({status: " Working ", response: `${info}`})
        }catch(err){
            res.status(404).json({status: "error", error: `${err}`})
        }
    }
}




module.exports = {tradeController};
