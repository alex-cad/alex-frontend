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
            <MyHeader className="sticky top-0 border-b border-slate-200" />
            <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8 text-slate-700">
                <div className="text-2xl">设计库</div>
            </div>
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 text-slate-700 grid sm:grid-cols-3 grid-cols-1 md:gap-8 gap-4">
                {
                    Array.from({ length: 5 }).map((_, index) => (
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
        </>
    );
}