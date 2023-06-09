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
			let headers = {
				'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`
			}
                        axios.put(API_USED.CANCEL_API + `${response.orderId}?eventId=${response.eventId}`, {}, {headers})
			.then((res) => {
			    console.log(res.data);
			    if(res.data.data.presentation.title === 'Exit Order Cancelled') {
				headers = {
                        	    'AUTHORIZATION': `Bearer ${API_USED.AUTH_TOKEN}`,
                        	    "appId": "in.probo.pro",
                        	    "x-device-os": "ANDROID",
                        	    "x-version-name": "5.38.3"
                    		}
				const data = {
                            		"exit_params": [
                                	{
                                            "exit_price": response.entry_price+0.5,
                                            "exit_type": "LO",
                                            "order_id": response.orderId
                                	}
                            	    ]
                                };
				axios.put(API_USED.EXIT_API, data, {headers})
				.then(async(res) => {
				    console.log("Exited again", res.data);
				    await placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
				}).catch((err) => {
					console.log("Error while exiting again!", err);
					axios.put(API_USED.EXIT_API, data, {headers})
					.then(async(res) => {
					    console.log("Exited again", res.data);
					await placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
					}).catch((err) => {
					    console.log("Error while exiting again", err);
					})
				    console.log(err);
				})
			    }
			else if(res.data.isError === false) {
                                placingOrdersProvider.deleteActive(response.orderId);
                                tradePlacedProvider.create(response.transactionId, response.orderId, 
                                    response.eventId, response.entry_price, response.entry_price, response.offer_type, response.order_type,
                                    0, "CANCELLED", formatDate(), formatDate(), response.createdAt);
                            } else {
                                console.log("Error while cancelling order !!!");
                            }
                        }).catch((err) => {
                            console.log("Error while canceling and exiting orders!!",err);
                        })
                    }  
                })
                responses = await placingOrdersProvider.get("EXIT PENDING");
                responses.map(async(response) => {
                    const bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
                    const end_time = await client.get(`end_time_${response.eventId}`);
		    const bapYesQuant = await client.get(`bap_yes_quantity_${response.eventId}`);
		    const bapNoQuant = await client.get(`bap_no_quantity_${response.eventId}`);
                    const timeDiff = Math.abs(Date.parse(end_time.replace('T',' ').slice(0,-6)) - Date.parse(formatDate()));
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if((parseFloat(bapYes) <= response.entry_price-API_USED.STOP_LOSS || parseFloat(bapYes) >= parseFloat(lc_yes)) && bapYesQuant > 30) {
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
                                    "exit_qty": 0
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
				    if(err.response.data.error === 'Order already completely exited!') {
					placingOrdersProvider.deleteActive(response.orderId);
				    }else {
					console.log("Error while modify exit",err);
				    }
                                })
                            }
                        } else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`);
                            if((parseFloat(bapNo) <= response.entry_price-API_USED.STOP_LOSS || parseFloat(bapNo) >= parseFloat(lc_no)) && bapNoQuant > 30) {
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
                                    "exit_qty": 0
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
				    if(err.response.data.error === 'Order already completely exited!') {
					placingOrdersProvider.deleteActive(response.orderId);
				    } else {
					console.log("Error while modify exit",err);
				    }
                                })
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
				    "exit_qty": 0
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
				console.log(Object.keys(err));
				if(err.response.data.error === 'Order already completely exited!') {
                                    placingOrdersProvider.deleteActive(response.orderId);
                                }
				console.log("Error while re exit", err);
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
                                    "exit_qty": 0
                            }
			    axios.put(API_USED.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                            .then((res) => {
                                console.log(res.data);
				if(res.data.data.error === 'Order already completely exited!') {
                                    placingOrdersProvider.deleteActive(response.orderId);
                                }
                                else if(res.data.statusCode === 200){
                                    placingOrdersProvider.updateActive(response.orderId, "MODIFY EXIT PENDING")
                                }else {
                                    console.log("Error while modifying exit");
                                }
                            }).catch((err) => {
				console.log(Object.keys(err));
                                if(err.response.data.error === 'Order already completely exited!') {
                                    placingOrdersProvider.deleteActive(response.orderId);
                                }
                                console.log("Error while re exit",err);
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
