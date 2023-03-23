const express = require("express");
const {tradeController} = require('./controllers/tradePlacement');

const router = express.Router();

router.route('/tradePlacement').post(tradeController.placeTrades);

module.exports = router;