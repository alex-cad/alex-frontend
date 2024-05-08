type Config = {
    company_name: string,
    router_map: {
        [key: string]: string
    }
}

let config: Config = {
    company_name: "Hahaha Company",
    router_map: {
        "designs": "我的设计",
        "adjusts": "调整的设计",
        "orders": "订单",
        "preference": "设置",
    }
    // designs: "我的设计",
    // adjusts: "调整的设计",
    // orders: "订单",
    // preference: "设置",
}

export default config;