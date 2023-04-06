const {placingOrdersProvider} = require('../dataprovider/placing.provider');
const {placingOrdersTestingProvider} = require('../dataprovider/placingOrderTesting.provider');
const  {tradePlacedProvider} = require('../dataprovider/tradePlaced.provider');
const axios = require('axios');
const dotenv = require('dotenv');
const formatDate = require('../utils/date');
const {client} = require('../utils/redis')
const {tradePlacedTestingProvider} = require('../dataprovider/tradePlacementTesting');

dotenv.config();
    const checkServices = {
        statisticalCheckPlacement: async()=>{
            try{
                let responses = placingOrdersProvider.get("PENDING");
                responses.map(async (response) => {
                    const timeDiff = Math.abs(formatDate.getTime() - response.updatedAt.getTime());
                    if(Math.floor((timeDiff / 1000) % 60) >= 2) {
                        axios.put(process.env.CANCEL_API + `${response.orderId}?eventId=${response.eventId}`)
                        .then((res) => {
                            if(res.isError === False) {
                                placingOrdersProvider.deleteActive(response.orderId);
                                tradePlacedProvider.create(response.transactionId, response.orderId, 
                                    response.eventId, response.entry_price, response.entry_price, record.offer_type, record.order_type,
                                    0, "CANCELLED", formatDate, formatDate, record.createdAt);
                            } else {
                                console.log("Error while cancelling order !!!");
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    }  
                })
                responses = placingOrdersProvider.get("EXIT PENDING");
                responses.map(async(response) => {
                    const bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
                    const end_time = await client.get(`end_time_${response.endId}`);
                    const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                    if(timeDiff>300) {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if(float(bapYes) === response.entry_price-1 || float(bapYes) === float(lc_yes)) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${process.env.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                }
                                const data = {
                                    "exit_price": float(f`bap_yes_price_${response.eventId}`),
                                    "exit_type": "LO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(process.env.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
                                    if(res.error === undefined) {
                                        placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
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
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapNo) === response.entry_price-1 || float(bapNo) === lc_no) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${process.env.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": float(f`bap_no_price_${response.eventId}`),
                                    "exit_type": "LO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(process.env.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
                                    if(res.error === undefined) {
                                        placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
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
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapYes) === response.entry_price-1 || float(bapYes) === lc_yes) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${process.env.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": float(f`bap_yes_price_${response.eventId}`),
                                    "exit_type": "MO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(process.env.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
                                    if(res.error === undefined) {
                                        placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
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
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapNo) === response.entry_price-1 || float(bapNo) === lc_no) {
                                headers={
                                    'AUTHORIZATION': `Bearer ${process.env.AUTH_TOKEN}`,
                                     "appId": "in.probo.pro",
                                     "x-device-os": "ANDROID",
                                     "x-version-name": "5.38.3"
                                
                                }
                                const data = {
                                    "exit_price": float(f`bap_no_price_${response.eventId}`),
                                    "exit_type": "MO",
                                    "request_type": "modify_exit",
                                    "exit_qty": 1
                                }
                                axios.put(process.env.CANCEL_AND_EXIT_API+`${response.orderId}`, data, {headers})
                                .then((res) => {
                                    if(res.error === undefined) {
                                        placingOrdersProvider.updateActive(response.orderId, "EXIT PENDING");
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
                setTimeout(checkServices.statisticalCheckPlacement(), 1000)
            }catch(err){
                console.log("Error found", err);
            }
        },
        statisticalCheckPlacementPaper: async () => {
            try{
                let responses = placingOrdersTestingProvider.get("PENDING");
                let bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                responses.map(async (response) => {
                    const timeDiff = Math.abs(formatDate.getTime() - response.updatedAt.getTime());
                    if(Math.floor((timeDiff / 1000) % 60) >= 2) {
                        placingOrdersTestingProvider.deleteActive(response.transactionId);
                        tradePlacedTestingProvider.create(response.order_type, response.transactionId, response.eventId, bapYes, 
                            bapYes, 0, response.createdAt, response.trigger_value, "CANCELLED", 
                            formatDate, formatDate);
                        }})
                responses = placingOrdersTestingProvider.get("EXIT PENDING");
                responses.map(async(response) => {
                    bapYes = await client.get(`bap_yes_price_${response.eventId}`);
                    const bapNo = await client.get(`bap_no_price_${response.eventId}`);
                    const end_time = await client.get(`end_time_${response.endId}`);
                    const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                    if(timeDiff>300) {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            if(float(bapYes) === response.entry_price-1 || float(bapYes) === float(lc_yes)) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, "EXIT PENDING");
                                }
                        }else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapNo) === response.entry_price-1 || float(bapNo) === lc_no) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, "EXIT PENDING");
                            }
                        } 
                    } else {
                        if(response.order_type === 'BUY') {
                            const lc_yes = await client.get(`lc_yes_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapYes) === response.entry_price-1 || float(bapYes) === lc_yes) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, "EXIT PENDING");
                            }
                        } else {
                            const lc_no = await client.get(`lc_no_${response.eventId}`); 
                            const end_time = await client.get(`end_time_${response.endId}`);
                            const timeDiff = Math.abs(end_time.getTime() - formatDate.getTime());
                            if(float(bapNo) === response.entry_price-1 || float(bapNo) === lc_no) {
                                placingOrdersTestingProvider.updateActive(response.transactionId, "EXIT PENDING");
                            }
                        }
                    }
                })
                setTimeout(checkServices.statisticalCheckPlacement(), 1000)
            }catch(err){
                console.log("Error found", err);
            }
        }
    }


module.exports = {checkServices}   
