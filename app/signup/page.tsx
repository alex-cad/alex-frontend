import { PhoneIcon, KeyIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import MyHeader from "@/app/ui/header";

export default function Signup() {
    return (
        <>
            <MyHeader className="" />
            <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
                <div className="card md:card-side card-bordered bg-base-200">
                    <figure>
                        <img src="/productAssets/sofa.png" alt="sofa" />
                    </figure>
                    <form className='flex-1 flex flex-col justify-between m-4'>
                        <div className='space-y-4'>
                            <h2 className="card-title justify-center">用户注册</h2>
                            <label className="input input-bordered flex items-center gap-2">
                                <PhoneIcon className='size-5' />
                                <input type="text" className="grow" placeholder="电话号码" />
                            </label>

                            <label className="input input-bordered flex items-center gap-2">
                                <KeyIcon className='size-5' />
                                <input type="password" className="grow" placeholder="密码" />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <KeyIcon className='size-5' />
                                <input type="text" className="grow" placeholder="确认密码" />
                            </label>
                        </div>
                        <button className="btn btn-primary w-full mt-4">注册</button>
                    </form>
                </div>
            </div>
        </>
    );
}