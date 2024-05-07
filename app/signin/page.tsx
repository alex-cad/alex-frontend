"use client"

import React from 'react';
import { BeakerIcon } from '@heroicons/react/24/solid'
import MyHeader from "@/app/ui/header";
import Link from 'next/link'
export default function Signin() {
    return (
        <>
            <MyHeader className="border-b border-slate-200" />
            <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-lg">
                    <form action="/user" className="mb-0 mt-6 space-y-4 rounded-lg bg-zinc-100 p-4 shadow-lg sm:p-6 lg:p-8">
                        <p className="text-center text-lg font-medium">用户登录</p>

                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>

                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="邮箱"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>

                            <div className="relative">
                                <input
                                    type="password"
                                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="密码"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Link className="text-sm text-gray-500" href="">忘记密码？</Link>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full rounded-lg bg-indigo-600  hover:bg-indigo-700 px-5 py-3 text-sm font-medium text-white"
                        >
                            登录
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            <Link className="underline" href="/signup">新用户注册</Link>
                        </p>
                    </form>
                </div>
            </div>
        </>

    );

}