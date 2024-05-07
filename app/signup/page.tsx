"use client";

import React, { useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import MyHeader from "@/app/ui/header";

export default function Signup() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isMatch, setIsMatch] = useState(true);
    const [isLengthValid, setIsLengthValid] = useState(true);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setIsLengthValid(e.target.value.length >= 8);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setIsMatch(e.target.value === password);
    };

    return (
        <>
            <MyHeader className="border-b border-slate-200" />
            <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-lg">
                    <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">Welcome to ALEX</h1>
                    <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
                        Design your dream from anywhere, anytime
                    </p>

                    <form action="#" className="mb-0 mt-6 space-y-4 rounded-lg bg-zinc-100 p-4 shadow-lg sm:p-6 lg:p-8">
                        <p className="text-center text-lg font-medium">新用户注册</p>

                        <div>
                            <label htmlFor="email" className="sr-only">邮箱</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="邮箱"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">密码</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    onChange={handlePasswordChange}
                                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="密码"
                                />

                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">确认密码</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    onChange={handleConfirmPasswordChange}
                                    className="w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
                                    placeholder="确认密码"
                                />
                                {!isLengthValid && <p className="text-red-500">密码长度必须至少为8位</p>}
                                {!isMatch && <p className="text-red-500">密码不一致</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-medium text-white"
                        >
                            注册
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            注册即代表同意我们的&nbsp;
                            <span><Link className="underline" href="">用户协议</Link></span>
                            &nbsp;和&nbsp;
                            <Link className="underline" href="">隐私政策</Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}