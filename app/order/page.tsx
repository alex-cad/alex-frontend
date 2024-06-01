import MyHeader from "@/app/ui/header";
import Image from 'next/image';
import { PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import Link from "next/link";

let products = [
    {
      id: 1,
      image: '/productAssets/table.png',
      name: '桌子',
      size: '1m*1m*1m',
      color: 'White',
      price: 100,
      quantity: 1
    },
    {
      id: 2,
      image: '/productAssets/chair.png',
      name: '椅子',
      size: '1m*1m*1m',
      price: 200,
      color: 'White',
      quantity: 2
    },
    {
      id: 3,
      image: '/productAssets/sofa.png',
      name: '沙发',
      size: '1m*1m*1m',
      price: 300,
      color: 'White',
      quantity: 3
    },
    {
      id: 4,
      image: '/productAssets/table2.jpg',
      name: '自定义办公桌（1m*2m)',
      size: '1m*1m*1m',
      color: 'White',
      price: 1200,
      quantity: 1
    },
  ];

export default function Page() {
    return (<>
        <MyHeader />
        <div className="main-content">
            <div className=' page-title'>订单</div>
            <div className="divider"></div>
            <div className="space-y-10">
                {
                    products.map((product, index) => (
                        <div key={index} className='card card-side card-bordered'>
                            <figure className=''>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={200}
                                    height={200}
                                    className=" size-32 md:size-48 object-cover"
                                />
                            </figure>
                            <div className='flex-1 p-4 flex flex-col justify-between'>

                                <div>
                                    <div className='flex justify-between'>
                                        <div>
                                            <h2 className=' card-title'>{product.name}</h2>
                                        </div>
                                        <div className='text-2xl text-bold'>
                                            ¥{(product.price * product.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="flex flex-row-reverse">
                                        单价：¥{product.price.toFixed(2)}
                                    </div>
                                </div>
                                <div className='flex flex-row-reverse items-center'>
                                    <div className='flex items-center'>
                                        <div className=' text-lg mx-2 font-bold'>{product.quantity}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))
                }
                <div className="flex flex-row-reverse">
                    <div className="text-2xl font-bold">
                        总价：¥{(products.reduce((acc, product) => acc + product.price * product.quantity, 0)).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="divider"></div>
            <div className=" space-y-4">
                <div className="flex gap-4">
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">收货人姓名</span>
                        </div>
                        <label className="input input-bordered flex items-center gap-2">
                            <UserIcon className="size-5" />
                            <input type="text" className="grow" placeholder="姓名" />
                        </label>
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">收货人手机号码</span>
                        </div>
                        <label className="input input-bordered flex items-center gap-2">
                            <PhoneIcon className="size-5" />
                            <input type="text" className="grow" placeholder="电话号码" />
                        </label>
                    </label>
                </div>
                <div className="flex gap-4">
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">省份</span>
                        </div>
                        <select className="select select-bordered">
                            <option>Pick one</option>
                            <option>Star Wars</option>
                            <option>Harry Potter</option>
                            <option>Lord of the Rings</option>
                            <option>Planet of the Apes</option>
                            <option>Star Trek</option>
                        </select>
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">城市</span>
                        </div>
                        <select className="select select-bordered">
                            <option>Pick one</option>
                            <option>Star Wars</option>
                            <option>Harry Potter</option>
                            <option>Lord of the Rings</option>
                            <option>Planet of the Apes</option>
                            <option>Star Trek</option>
                        </select>
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">区县</span>
                        </div>
                        <select className="select select-bordered">
                            <option>Pick one</option>
                            <option>Star Wars</option>
                            <option>Harry Potter</option>
                            <option>Lord of the Rings</option>
                            <option>Planet of the Apes</option>
                            <option>Star Trek</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text">详细地址</span>
                        </div>
                        <textarea className="textarea textarea-bordered h-24" placeholder="示例：xx"></textarea>
                    </label>
                </div>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">配送方式</span>
                    </div>
                    <select className="select select-bordered">
                        <option>顺丰</option>
                    </select>
                </label>
            </div>

            {/* <div className="divider"></div>
            <div>
                礼品卡
            </div> */}
            {/* <div className="divider"></div>
            <div>
                发票
            </div> */}

            <div className="divider"></div>
            <div className="space-y-4">
                <div className="flex flex-row-reverse font-medium text-base">总价：¥{(products.reduce((acc, product) => acc + product.price * product.quantity, 0)).toFixed(2)}</div>
                <div className="flex flex-row-reverse font-medium text-base">运费：¥0.00</div>
                <div className="flex flex-row-reverse h2-title text-red-600">付款金额：¥{(products.reduce((acc, product) => acc + product.price * product.quantity, 0)).toFixed(2)}</div>
            </div>
            <div className="flex flex-row-reverse mt-4">
                <Link className="btn btn-wide btn-primary" href="/pay">
                    付款
                </Link>
            </div>
        </div>
    </>)
}