"use client";

import MyHeader from "@/app/ui/header";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Design({ params }: { params: { id: string } }) {
    let router = useRouter();
    return (
        <>
            <MyHeader />
            <div className="main-content">
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
                                        className="rounded object-cover aspect-square size-16 hover:scale-110 transition duration-300 ease-in-out"
                                    />
                                </button>
                                <button className="overflow-hidden rounded">
                                    <img
                                        src="/productAssets/table.png"
                                        alt="table image"
                                        className="rounded object-cover aspect-square size-16 hover:scale-110 transition duration-300 ease-in-out"
                                    />
                                </button>
                            </div>
                            <div className="">
                                <button className="btn btn-outline font-semibold text-2xl size-16">3D</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 md:mt-0 mt-4 space-y-4">
                        <div className="page-title">
                            设计（ID：{params.id}）
                        </div>
                        <div className="h2-title">
                            ¥250
                        </div>
                        <div className="">
                            设计描述Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                            pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                            mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                            dignissimos. Molestias explicabo corporis voluptatem?
                        </div>
                        <div className="md:flex gap-4">
                            <div className="flex-1">
                                <Link 
                                    href = "/cad"
                                    className="btn btn-block"
                                    onClick={() => router.push(`/cad`)}
                                >
                                    定制设计
                                </Link>
                            </div>
                            <div className="flex-1 md:mt-0 mt-4">
                                <Link
                                    className="btn btn-primary btn-block"
                                    // onClick={() => router.push(`/designs/${params.id}/adjust`)}
                                    href = {`/designs/${params.id}/adjust`}
                                >
                                    调整设计
                                </Link>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="">
                            <div className="h2-title mb-4">下载</div>
                            <div className="flex">
                                <button className="btn btn-link">
                                    <a href="#">物料清单</a>
                                </button>
                                <button className="btn btn-link">
                                    <a href="#">技术规格.pdf</a>
                                </button>
                                <button className="btn btn-link">
                                    <a href="#">搭建手册.pdf</a>
                                </button>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="">
                            <div className="h2-title">链接分享</div>
                            <span className="inline-flex rounded-md border border-base-200 my-4">
                                <div
                                    className=" px-4 py-2 text-sm font-medium focus:relative font-mono bg-base-200 flex items-center"
                                >
                                    https://www.example.com/designs/1
                                </div>

                                <button
                                    className="btn rounded-none border-l bg-base-100"
                                >
                                    复制到粘贴板
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="divider"></div>
                <div className="">
                    <div className="h2-title my-4">相关设计</div>
                    <div className="grid grid-cols-3 gap-4">
                        {
                            Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="card group overflow-hidden"

                                >
                                    <figure className="overflow-hidden">
                                        <img
                                            alt=""
                                            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                                            className="h-56 w-full object-cover group-hover:scale-105 transition duration-300 ease-in-out"
                                        />
                                    </figure>
                                    <div className='bg-base-200'>
                                        <div className="card-body">
                                            <h2 className="card-title">Shoes!</h2>
                                            <p>If a dog chews shoes whose shoes does he choose?</p>
                                            <div className="card-actions justify-end">

                                            </div>
                                        </div>
                                        <div className="border-t border-base-100">
                                            <button className="btn btn-block rounded-none" onClick={() => router.push(`/designs/${index}`)}>查看详情 -{">"} </button>
                                        </div>
                                    </div>


                                    {/* <div className="card-body">
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
                                </div> */}
                                </div>
                            ))
                        }
                    </div>
                </div>

            </div>
            <div className=" bg-base-200 h-80">

            </div>
        </>
    )
}
