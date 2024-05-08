"use client";

import { usePathname, useRouter } from "next/navigation";

const order_types = [
    { name: "全部订单", path: "/user/orders" },
    { name: "待付款", path: "/user/orders/prepay" },
    { name: "待发货", path: "/user/orders/preship" },
    { name: "待收货", path: "/user/orders/prerecv" },
    { name: "已完成", path: "/user/orders/finished" },
]

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let pathname = usePathname();
    const router = useRouter()
    return (
        <div>
            <div className="my-8  border-b border-slate-200">
                {order_types.map((type) => (
                    <button
                        key={type.name}
                        className=" text-lg text-gray-500 font-semibold  pr-8"
                        onClick={() => router.push(`${type.path}`)}
                    >
                        <div
                            
                            className={
                                pathname.endsWith(type.path)
                                    ? "pb-4 border-b-4 border-blue-400 text-gray-700 transition "
                                    : "pb-4 hover:border-b-4 hover:text-gray-700 transition "
                            }
                        >
                            {type.name}
                        </div>
                    </button>
                ))}
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}