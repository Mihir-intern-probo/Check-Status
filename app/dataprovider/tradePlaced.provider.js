const { TradesPlaced } = require('../models/tradesPlaceds');

const tradePlacedProvider = {
    create: (transactionId, orderId, eventId, entryPrice, exitPrice,
        offerType, orderType, profit, status, createdAt, updatedAt, tradePlacedAt) => {
        TradesPlaced.create({
            transactionId,
            order_id: orderId,
            eventId,
            entry_price: entryPrice,
            exit_price: exitPrice,
            offer_type:offerType,
            order_type: orderType,
            profit,
            status,
            createdAt,
            updatedAt,
            tradePlacedAt
        });
    }
}

module.exports = {tradePlacedProvider};