"use client";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import {
    ArchiveBoxXMarkIcon,
    ChevronDownIcon,
    PencilIcon,
    Square2StackIcon,
    TrashIcon,
} from '@heroicons/react/16/solid'
import MyHeader from "@/app/ui/header";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function DesignsPage() {
    let router = useRouter();
    return (
        <>
            <MyHeader />
            <div className="main-content">
                <div className="page-title">设计库</div>
                <div className='divider'></div>
                <div className='grid sm:grid-cols-3 grid-cols-1 md:gap-8 gap-4'>
                    {
                        Array.from({ length: 5 }).map((_, index) => (
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
                <div className='divider'></div>
                <div className="join w-full justify-center my-10">
                    <button className="join-item btn">上一页</button>
                    <button className="join-item btn">1</button>
                    <button className="join-item btn btn-active">2</button>
                    <button className="join-item btn">3</button>
                    <button className="join-item btn">4</button>
                    <button className="join-item btn">下一页</button>
                </div>
            </div>
        </>
    );
}