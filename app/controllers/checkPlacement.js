const {checkServices} = require('../services/checkServices')

const checkController={

    checkTrades: async(req,res)=>{
        try{
            // CHECK FOR AUTHENTICATION
            const info = checkServices.statisticalCheckPlacement();
	    console.log("Started Checking Orders");
            res.status(200).json({status: " Working ", response: `${info}`})
        }catch(err){
            res.status(404).json({status: "error", error: `${err}`})
        }
    }
}




module.exports = {checkController};
