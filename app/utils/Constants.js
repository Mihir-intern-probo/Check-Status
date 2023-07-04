const API_USED = {
	AUTH_TOKEN: "TraIE6GU+Vf2IoRHijBvgvvT461Mshz+EIMOLuWpmfs=",
	SOCKET: "wss://falcon.api.probo.in",
	EXIT_API: "https://prod.api.probo.in/api/v2/oms/order/exit",
	CANCEL_API: "https://prod.api.probo.in/api/v1/oms/order/cancel/",
	CHECK_ORDER_EXIT: "https://prod.api.probo.in/api/v1/oms/order/exit/info?order_id=",
	CHECK_ORDER_STATUS: "https://prod.api.probo.in/api/v2/oms/order/Summary/",
	ORDER_API: "https://prod.api.probo.in/api/v1/oms/order/initiate",
	CANCEL_AND_EXIT_API :"https://prod.api.probo.in/api/v3/oms/order/exit/",
	STOP_LOSS: 1.5
};
module.exports = API_USED;
