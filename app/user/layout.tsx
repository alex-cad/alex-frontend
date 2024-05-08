"use client";

import { redirect, usePathname, useRouter } from 'next/navigation';
import MyHeader from "@/app/ui/header";
import config from "@/app/config";
function SettingIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
    )
}

function BillingIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
    )
}

function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    )
}

function DesignsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
    )
}

function AdjustsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
        </svg>
    )
}
const sidebtns = [
    {
        name: "我的设计",
        icon: DesignsIcon,
        ref: "/user/designs",
    },
    {
        name: "调整的设计",
        icon: AdjustsIcon,
        ref: "/user/adjusts",
    },
    {
        name: "订单",
        icon: BillingIcon,
        ref: "/user/orders",
    },
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    console.log(pathname);
    return (
        <div className='flex flex-col min-h-screen'>
            <MyHeader className='top-0 border-b border-slate-200' />

            <div className="flex flex-1">
                <div className="flex flex-col justify-between border-e bg-white">
                    <div>
                        <div className="inline-flex size-16 items-center justify-center">
                            <span
                                className="grid size-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600"
                            >
                                L
                            </span>
                        </div>

                        <div className="border-t border-gray-100">
                            <div className="px-2">
                                <div className="py-4">
                                    <a
                                        href="/user"
                                        className={
                                            pathname === "/user"
                                                ? "t group relative flex justify-center rounded px-2 py-1.5 text-blue-700 bg-blue-50"
                                                : "t group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        }
                                    >
                                        <HomeIcon />
                                        <div
                                            className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2  rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible min-w-16 text-center"
                                        >
                                            主页
                                        </div>
                                    </a>
                                </div>

                                <ul className="space-y-1 border-t border-gray-100 pt-4">
                                    {sidebtns.map((btn) => (
                                        <li key={btn.name}>
                                            <a
                                                href={btn.ref}
                                                className={
                                                    pathname === btn.ref
                                                        ? "group relative flex justify-center rounded px-2 py-2 my-2 text-blue-700 bg-blue-50"
                                                        : "group relative flex justify-center rounded px-2 py-2 my-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                }
                                            >
                                                <btn.icon />
                                                <div
                                                    className="invisible absolute start-full ms-4 top-1/2 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible min-w-20 text-center"
                                                >
                                                    {btn.name}
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 bg-white p-2">
                        <a
                            href="/user/preference"
                            className={
                                pathname === "/user/preference"
                                    ? "t group relative flex justify-center rounded px-2 py-1.5 text-blue-700 bg-blue-50"
                                    : "t group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }
                        >
                            <SettingIcon />

                            <div
                                className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible min-w-16 text-center"
                            >
                                设置
                            </div>
                        </a>
                    </div>
                </div>
                <div className="flex-1" >
                    <div className="mx-auto max-w-screen-lg">
                        {/* <div className='pb-4'>
                            <div className="flex text-sm items-center text-gray-500">
                                <div>
                                    <a href="#" className="block transition hover:text-gray-400">
                                        <span className="sr-only"> Home </span>

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                        </svg>
                                    </a>
                                </div>
                                {

                                    pathname.split("/").slice(2).map((v, index) => (
                                        <>
                                            <div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>

                                            <div>
                                                <a href="#" className="block transition hover:text-gray-400"> {config.router_map[v]} </a>
                                            </div>
                                        </>
                                    ))
                                }
                            </div>
                        </div> */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}