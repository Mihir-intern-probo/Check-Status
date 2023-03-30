const express = require("express");
const {checkController} = require('./controllers/checkPlacement.js');

const router = express.Router();

router.route('/checktradePlacement').post(checkController.checkTrades);

module.exports = router;
