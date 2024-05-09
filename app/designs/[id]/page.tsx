"use client";

import MyHeader from "@/app/ui/header";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Design({ params }: { params: { id: string } }) {
    let router = useRouter();
    return (
        <>
            <MyHeader className="sticky top-0 border-b border-slate-200" />
            <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8 text-slate-700">
                <div className="md:flex gap-16">
                    <div className="flex-1">
                        <img
                            src="/productAssets/table.png"
                            alt="table image"
                            className="rounded object-cover aspect-square"
                        />
                        <div className="flex justify-between mt-4">
                            <div className="flex gap-4">
                                <button className="overflow-hidden rounded">
                                    <img
                                        src="/productAssets/table.png"
                                        alt="table image"
                                        className="rounded object-cover aspect-square size-20 hover:scale-110 transition duration-300 ease-in-out"
                                    />
                                </button>
                                <button className="overflow-hidden rounded">
                                    <img
                                        src="/productAssets/table.png"
                                        alt="table image"
                                        className="rounded object-cover aspect-square size-20 hover:scale-110 transition duration-300 ease-in-out"
                                    />
                                </button>
                            </div>
                            <div className="">
                                <button className="text-green-700 font-semibold text-2xl size-20 border-2 rounded-md hover:border-slate-400 transition">3D</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 md:mt-0 mt-4 space-y-10">
                        <div className=" font-bold text-3xl">
                            设计（ID：{params.id}）
                        </div>
                        <div className=" font-bold text-2xl">
                            ¥250
                        </div>
                        <div className=" text-gray-400">
                            设计描述Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                            pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                            mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                            dignissimos. Molestias explicabo corporis voluptatem?
                        </div>
                        <div className="md:flex gap-4">
                            <div className="flex-1">
                                <button
                                    className="w-full h-full text-gray-700 hover:bg-gray-50 border-2 border-green-700 px-8 py-2 rounded-md transition"
                                    onClick={() => router.push(`/designs/${params.id}/adjust`)}
                                >
                                    定制设计
                                </button>
                            </div>
                            <div className="flex-1 md:mt-0 mt-4">
                                <button
                                    className="w-full h-full text-white bg-green-700 px-8 py-2 rounded-md hover:bg-green-800 transition "

                                >
                                    调整设计
                                </button>
                            </div>
                        </div>
                        <div className=" border-t border-slate-200 text-gray-400">
                            <div className="text-xl py-4 text-gray-700">下载</div>
                            <div className="space-y-4">
                                <div className="underline underline-offset-4">
                                    <a href="#">物料清单</a>
                                </div>
                                <div className="underline underline-offset-4">
                                    <a href="#">技术规格.pdf</a>
                                </div>
                                <div className="underline underline-offset-4">
                                    <a href="#">搭建手册.pdf</a>
                                </div>
                            </div>
                        </div>
                        <div className=" border-t border-slate-200">
                            <div className="text-xl py-4">链接分享</div>
                            <span className="inline-flex -space-x-px overflow-hidden rounded-md border bg-white shadow-sm">
                                <div
                                    className="inline-block px-4 py-2 text-sm font-medium text-gray-700 focus:relative font-mono"
                                >
                                    https://www.example.com/designs/1
                                </div>

                                <button
                                    className="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:relative border-l"
                                >
                                    复制到粘贴板
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                <div className=" border-t border-slate-200">
                    <div className="text-3xl py-8">相关设计</div>
                    <div className="grid grid-cols-3 gap-4">
                        {
                            Array.from({ length: 3 }).map((_, index) => (
                                <button
                                    key={index}
                                    className="group overflow-hidden rounded-lg border border-slate-200"
                                    onClick={() => router.push(`/designs/${index}`)}
                                >
                                    <div className="overflow-hidden">
                                        <img
                                            alt=""
                                            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                                            className="h-56 w-full object-cover group-hover:scale-105 transition duration-300 ease-in-out"
                                        />
                                    </div>


                                    <div className="bg-white p-4 sm:p-6">
                                        <time dateTime="2022-10-10" className="block text-xs text-gray-500"> 10th Oct 2022 </time>

                                        <span>
                                            <h3 className="mt-0.5 text-lg text-gray-900">How to position your furniture for positivity</h3>
                                        </span>

                                        <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                            pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                            mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                            dignissimos. Molestias explicabo corporis voluptatem?
                                        </p>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                </div>

            </div>
            <div className=" bg-slate-50 h-80">

            </div>
        </>
    )
}
