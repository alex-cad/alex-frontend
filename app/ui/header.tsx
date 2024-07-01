"use client"

import { useState } from 'react'
import Link from 'next/link'
import { CreditCardIcon, HomeIcon, HeartIcon, ArrowsRightLeftIcon, CubeIcon, UserIcon } from "@heroicons/react/24/outline";

const Links = [
    { name: '设计库', href: '/designs' },
    { name: 'Robotic', href: '/arucoDetect' },
]

const personalLinks = [
    { name: '我的主页', href: '/user', icon: HomeIcon },
    { name: '我的订单', href: '/user/orders', icon: CreditCardIcon },
    { name: '我的收藏', href: '/user/favorites', icon: HeartIcon },
    { name: '调整的设计', href: '/user/adjusts', icon: ArrowsRightLeftIcon },
    { name: '我的设计', href: '/user/designs', icon: CubeIcon },
    { name: '个人信息', href: '/user/preference', icon: UserIcon },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

function CartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
    )
}

function Bars3Icon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    )
}

export default function MyHeader({ className = "" }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className={className + `navbar px-8 py-4 backdrop-blur-lg sticky top-0 bg-base-100 bg-opacity-90 z-50`}>
            <div className='navbar-start space-x-2'>
                <Link className="m-2 rounded-box btn" href="/" scroll={false}>
                    LOGO
                </Link>
                {
                    Links.map((link, index) => (
                        <Link key={index} href={link.href} className='btn btn-ghost hidden md:flex' scroll={false}>{link.name}</Link>
                    ))
                }
            </div>
            <div className='navbar-end space-x-4'>
                <input type="checkbox" value="light" className="toggle theme-controller hidden md:flex" />
                <div className="indicator">
                    <span className="indicator-item badge badge-error badge-xs">2</span>
                    <Link href="/cart" className="btn btn-active btn-ghost " scroll={false}><CartIcon /></Link>
                </div>

                <Link href="/signin" className='btn btn-primary' scroll={false}>登录</Link>
                <Link href="/signup" className='btn btn-outline hidden md:flex' scroll={false}>注册</Link>
                <div className="dropdown dropdown-end md:hidden">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
                        <Bars3Icon />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                        <Link href="/signup" className='btn btn-ghost' scroll={false}>注册</Link>
                        {
                            Links.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className='btn btn-ghost' scroll={false}>{link.name}</Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div className="dropdown dropdown-end">
                    <div className='flex items-center'>
                        <div tabIndex={0} role="button" className="avatar indicator">
                            <span className="indicator-item badge badge-xs badge-error">1</span>
                            <div className="btn btn-circle w-12 rounded-full">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                            </div>
                        </div>
                    </div>

                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                        {
                            personalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className='btn btn-ghost' scroll={false}>
                                        <link.icon className="w-6 h-6" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </header>
    )
}
