"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import MyHeader from "@/app/ui/header";
import Link from "next/link";
import { div } from 'three/examples/jsm/nodes/Nodes.js';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
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
];

export default function CartPage() {
  let [edit, setEditState] = useState(false);

  return (
    <>
      <MyHeader />
      <main className='main-content'>
        <div className='flex justify-between'>
          <div className=' text-4xl font-extrabold'>购物车</div>
          {
            edit ?
              <button className='btn' onClick={() => setEditState(false)}>完成编辑</button> :
              <button className='btn' onClick={() => setEditState(true)}>编辑购物车</button>
          }
        </div>

        <div className="divider"></div>
        {products.length === 0 &&
          <>

            <div className="hero min-h-96">
              <div className="hero-content flex-col text-center">
                <h1 className="fact">空空如也</h1>
                <button className='btn'>看看设计库</button>
              </div>
            </div>
          </>
        }
        <div className=' space-y-8'>
          {
            products.map((product, index) => (
              <div key={index} className='card card-side card-bordered hover:outline outline-4 outline-offset-4 outline-base-300'>
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
                  <div className='flex justify-between'>
                    <div>
                      <h2 className=' card-title'>{product.name}</h2>
                    </div>
                    <div className='text-2xl text-bold'>
                      ¥{product.price.toFixed(2)}
                    </div>
                  </div>
                  <div className='flex flex-row-reverse items-center'>
                    {
                      edit ? <button className='btn btn-sm btn-error'>删除</button> : <></>
                    }
                    <div className='flex items-center'>
                      <button className="btn btn-circle btn-ghost">
                        <MinusIcon className='size-5' />
                      </button>
                      <div className=' text-lg mx-2 font-bold'>{product.quantity}</div>
                      <button className="btn btn-circle btn-ghost">
                        <PlusIcon className='size-5' />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          }
        </div>

        <div className={products.length === 0 ? "hidden" : "" + ""}>
          <div className="divider"></div>
          <div className='flex flex-row-reverse'>
            <Link className='btn btn-primary btn-block md:btn-wide' href="/order" scroll={false}>下单</Link>
          </div>
        </div>
      </main>
    </>
  );
}