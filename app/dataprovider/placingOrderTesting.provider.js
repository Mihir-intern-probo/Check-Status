const { placeTradesForTesting } = require('../models/placeOrderTesting');
const date = require('../utils/date');
const placingOrdersTestingProvider = {
    updateActive: async (id,exit_price, status) => {
        await placeTradesForTesting.update({status, exit_price, updatedAt: date},{
            where: {
                transactionId: id
            }
        })
    },
    deleteActive: (id) => {
        placeTradesForTesting.destroy({
            where:{
                transactionId: id
            }
        })
    },
    get: async (status) => {
        const data = await placeTradesForTesting.findAll({
            where:{
                status,
            }
        })
        return data;
    },
}

module.exports = {placingOrdersTestingProvider};