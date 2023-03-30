const { activeOrdersPlaced } = require('../models/activeOrderPlaced');
const date = require('../utils/date');
const placingOrdersProvider = {
    updateActive: async (id, status) => {
        await activeOrdersPlaced.update({status, updatedAt: date},{
            where: {
                orderId: id
            }
        })
    },
    deleteActive: (id) => {
        activeOrdersPlaced.destroy({
            where:{
                orderId: id
            }
        })
    },
    get: async (status) => {
        const data = await activeOrdersPlaced.findAll({
            where:{
                status,
            }
        })
        return data;
    },
}

module.exports = {placingOrdersProvider};