"use client"

import React from 'react';
import image from 'next/image';
import MyHeader from "@/app/ui/header";

let products = [
  {
    id: 1,
    image: 'productAssets/table.png',
    name: '桌子',
    size: '1m*1m*1m',
    color: 'White',
    price: 100,
    quantity: 1
  },
  {
    id: 2,
    image: 'productAssets/chair.png',
    name: '椅子',
    size: '1m*1m*1m',
    price: 200,
    color: 'White',
    quantity: 2
  },
  {
    id: 3,
    image: 'productAssets/sofa.png',
    name: '沙发',
    size: '1m*1m*1m',
    price: 300,
    color: 'White',
    quantity: 3
  },

];

export default function CartPage() {
  return (

    <>
      <MyHeader className=" sticky top-0 border-b border-slate-200" />
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <header className="text-center py-8">
              <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">购物车</h1>
            </header>

            <span className="flex items-center">
              <span className="h-px flex-1 bg-slate-200"></span>
            </span>

            <div className="mt-8">
              <ul className="space-y-4">
                {products.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <li key={product.id} className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-40 rounded object-cover"
                      />

                      <div>
                        <h3 className=" text-gray-900">{product.name}</h3>

                        <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                          <div>
                            <dt className="inline">尺寸：</dt>
                            <dd className="inline">{product.size}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="flex flex-1 items-center justify-end gap-2">
                        <div className="text-lg text-gray-900">¥{product.price}</div>

                        <div>
                          <label htmlFor={`Line${product.id}Qty`} className="sr-only"> Quantity </label>
                          <div className="flex items-center rounded border border-gray-300">
                            <button type="button" className="size-10 leading-10 text-gray-600 transition hover:opacity-75">
                              -
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              id={`Line${product.id}Qty`}
                              className="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                              onChange={(a)=>{console.log(a)}}

                            />
                            <button type="button" className="size-10 leading-10 text-gray-600 transition hover:opacity-75">
                              +
                            </button>
                          </div>
                        </div>

                        <button className=" ml-4 text-gray-600 transition hover:text-red-600">
                          <span className="sr-only">Remove item</span>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>

                    </li>

                    {/* 分割线 */}
                    {index < products.length - 1 && (
                      <hr className="border-t border-gray-300 my-4" />
                    )}
                  </React.Fragment>
                ))}

              </ul>

              <div className="mt-8 flex justify-end border-t border-gray-400 pt-8">
                <div className="w-screen max-w-lg space-y-4">
                  <dl className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <dt>原价</dt>
                      <dd>¥250</dd>
                    </div>


                    <div className="flex justify-between">
                      <dt>为您节省</dt>
                      <dd>-¥20</dd>
                    </div>

                    <div className="flex justify-between !text-lg font-medium">
                      <dt>总价</dt>
                      <dd>¥230</dd>
                    </div>
                  </dl>

                  <div className="flex justify-end">
                    <span
                      className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-indigo-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="-ms-1 me-1.5 h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                        />
                      </svg>

                      <p className="whitespace-nowrap text-xs">2个优惠券</p>
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href="#"
                      className="block rounded bg-indigo-600  hover:bg-indigo-700 px-10 py-3 text-sm text-gray-100 transition"
                    >
                      下单
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>

  );
}