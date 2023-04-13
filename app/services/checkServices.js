const {placingOrdersProvider} = require('../dataprovider/placing.provider');
const {placingOrdersTestingProvider} = require('../dataprovider/placingOrderTesting.provider');
const  {tradePlacedProvider} = require('../dataprovider/tradePlaced.provider');
const axios = require('axios');
const path = require("path");
const dotenv = require('dotenv').config();
const formatDate = require('../utils/date');
const {client} = require('../utils/redis')
const {tradePlacedTestingProvider} = require('../dataprovider/tradePlacementTesting');
const API_USED = require('../utils/Constants.js');
const moment = require('moment');

    const checkServices = {
        statisticalCheckPlacement: async()=>{
            try{
		console.log(formatDate())
                let responses =await placingOrdersProvider.get("PENDING");
                responses.map(async (response) => {
                    const timeDiff = Math.abs(Date.parse(formatDate()) - response.updatedAt.getTime());
		    console.log((timeDiff/1000));
                    if(Math.floor((timeDiff / 1000) >= 2)){
			const headers = {
				'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`
			}
                        axios.put(API_USED.CANCEL_API + `${response.orderId}?eventId=${response.eventId}`, {}, {headers})
			.then((res) => {
			    console.log(res.data);
			    if(res.data.data.message === 'Exit Order Cancelled') {
				const headers1 = {
                        	    'AUTHORIZATION': `Bearer ${CONSTANTS.API_USED.AUTH_TOKEN}`,
                        	    "appId": "in.probo.pro",
                        	    "x-device-os": "ANDROID",
                        	    "x-version-name": "5.38.3"
                    		}
				const data = {
                            		"exit_params": [
                                	{
                                            "exit_price": data1.l1_avg_matched_price+0.5,
                                            "exit_type": "LO",
                                            "order_id": data1.orderId
                                	}
                            	    ]
                                };
				axios.put(CONSTANTS.API_USED.EXIT_API, data, {headers1})
				.then((res) => {
				    console.log("Exited again", res.data);
				    placingOrdersProvider.updateActive(data1.orderId, "EXIT PENDING");
				}).catch((err) => {
				    console.log(err);
				})
			    }
                            if(res.data.isError === false) {
                                placingOrdersProvider.deleteActive(response.orderId);
                                tradePlacedProvider.create(response.transactionId, response.orderId, 
                                    response.eventId, response.entry_price, response.entry_price, response.offer_type, response.order_type,
                                    0, "CANCELLED", formatDate(), formatDate(), response.createdAt);
                            } else {
                                console.log("Error while cancelling order !!!");
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    }  
                })
                responses = await placingOrdersProvider.get("EXIT PENDING");
                responses.map(async(response) => {
                    const bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
                    const end_time = await client.get(`end_time_${response.eventId}`);
                    const timeDiff = Math.abs(Date.parse(end_time.replace('T',' ').slice(0,-6)) - Date.parse(formatDate()));
                    if(timeDiff/1000>300) {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if(parseFloat(bapYes) <= response.entry_price-2 || parseFloat(bapYes) === parseFloat(lc_yes)) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                }
                                const data = {
                                    "exit_price": parseFloat(bapYes),
                                    "exit_type": "LO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
					console.log(res.data);
                                    if(res.data.statusCode === 200) {
                                        placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING");
                                    } else {
                                        console.log("Error while cancelling and placing exit !!!");
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                            }
                        } else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`);
                            if(parseFloat(bapNo) <= response.entry_price-2 || parseFloat(bapNo) === parseFloat(lc_no)) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": parseFloat(bapNo),
                                    "exit_type": "LO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
					console.log(res.data);
                                    if(res.data.statusCode === 200) {
                                        placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING");
                                    } else {
                                        console.log("Error while cancelling and placing exit !!!");
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                            }
                        }
                    } else {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if(parseFloat(bapYes) <= response.entry_price-2 || parseFloat(bapYes) === parseFloat(lc_yes)) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": parseFloat(bapYes),
                                    "exit_type": "MO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
					console.log(res.data);
                                    if(res.data.statusCode === 200) {
                                        placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING");
                                    } else {
                                        console.log("Error while cancelling and placing exit !!!");
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                            }
                        } else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`); 
                            if(parseFloat(bapNo) <= response.entry_price-2 || parseFloat(bapNo) === parseFloat(lc_no)) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": parseFloat(bapNo),
                                    "exit_type": "MO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
					console.log(res.data);
                                    if(res.data.statusCode === 200) {
                                        placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING");
                                    } else {
                                        console.log("Error while cancelling and placing exit !!!");
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                            }
                        }
                    }
                })
		const modifiedResp = await placingOrdersProvider.get("MODIFY EXIT PENDING");
		modifiedResp.map(async(response) => {
		    const bapYes = await client.get(`bap_yes_price_${response.eventId}`);
		    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
	            const timeDiff = Date.parse(formatDate())-Date.parse(response.updatedAt);
		    if((timeDiff/1000)>5){
			if(response.order_type === 'BUY') {
			    const headers = {
				'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
				'appId': 'in.probo.pro',
				'x-device-os': 'ANDROID',
				'x-version-name': '5.38.3',
			    }
			    const data = {
				    "exit_price": parseFloat(bapYes),
				    "exit_type": "LO",
				    "request_type": "modify_exit",
				    "exit_qty": 1
			    }
			    axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
			    .then((res) => {
				console.log(res.data);
				if(res.data.statusCode === 200){
				    placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING")
				}else {
				    console.log("Error while modifying exit");
				}
			    }).catch((err) => {
				console.log(err);
			    })
			} else {
			    const headers = {
                                'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                                'appId': 'in.probo.pro',
                                'x-device-os': 'ANDROID',
                                'x-version-name': '5.38.3',
                            }
                            const data = {
                                    "exit_price": parseFloat(bapNo),
                                    "exit_type": "LO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                            }
			    axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                            .then((res) => {
                                console.log(res.data);
                                if(res.data.statusCode === 200){
                                    placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING")
                                }else {
                                    console.log("Error while modifying exit");
                                }
                            }).catch((err) => {
                                console.log(err);
                            })
			}
		    }
		})
                setTimeout(checkServices.statisticalCheckPlacement, 1000)
            }catch(err){
                console.log("Error found", err);
            }
        },
        statisticalCheckPlacementPaper: async () => {
            try{
		console.log(formatDate())
                let responses = await placingOrdersTestingProvider.get("PENDING");
                responses.map(async (response) => {
                    let bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const timeDiff = Math.abs(formatDate() - response.updatedAt.getTime());
                    if(Math.floor((timeDiff / 1000) % 60) >= 2) {
                        placingOrdersTestingProvider.deleteActive(response.transactionId);
                        tradePlacedTestingProvider.create(response.order_type, response.transactionId, response.eventId, bapYes, 
                            bapYes, 0, response.createdAt, response.trigger_value, "CANCELLED", 
                            formatDate, formatDate);
                        }})
                responses = await placingOrdersTestingProvider.get("EXIT PENDING");
                responses.map(async(response) => {
                    bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
                    const end_time = await client.get(`end_time_${response.endId}`);
                    const timeDiff = Math.abs(end_time - formatDate());
                    if(timeDiff>300) {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if(parseFloat(bapYes) === response.entry_price-1 || parseFloat(bapYes) === parseFloat(lc_yes)) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, bapYes, "EXIT PENDING");
                                }
                        }else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time - formatDate());
                            if(parseFloat(bapNo) === response.entry_price-1 || parseFloat(bapNo) === lc_no) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, bapNo,"EXIT PENDING");
                            }
                        } 
                    } else {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time - formatDate());
                            if(parseFloat(bapYes) === response.entry_price-1 || parseFloat(bapYes) === lc_yes) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, bapYes, "EXIT PENDING");
                            }
                        } else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time - formatDate());
                            if(parseFloat(bapNo) === response.entry_price-1 || parseFloat(bapNo) === lc_no) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, bapNo, "EXIT PENDING");
                            }
                        }
                    }
                })
                setTimeout(checkServices.statisticalCheckPlacementPaper, 1000)
            }catch(err){
                console.log("Error found", err);
            }
        }
    }


module.exports = {checkServices}   
