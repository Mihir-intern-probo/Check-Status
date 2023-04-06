const { TestingResponse } = require('../models/testingTrades');

const tradePlacedTestingProvider = {
    create: (transactionId, eventId, BAP, exitPrice,
         orderType, profit, status, createdAt, updatedAt, tradePlacedAt) => {
        TestingResponse.create({
            order_type: orderType,
            transaction_id: transactionId,
            event_id: eventId,
            BAP,
            Exit_Price: exitPrice,
            profit,
            trade_place_time: tradePlacedAt,
            trigger_value,
            status,
            createdAt,
            updatedAt
        });
    }
}

module.exports = {tradePlacedTestingProvider};