import MyHeader from "@/app/ui/header";
import { CheckCircleIcon } from '@heroicons/react/24/outline'
export default function Page() {
    return (
        <>
            <MyHeader />
            <div className="main-content">
                <div className="card card-side bg-base-200 items-center p-4">
                    <CheckCircleIcon className="size-20 text-success" />
                    <div className="m-4 space-y-4">
                        <div className=" card-title">您的订单已提交成功，请尽快付款</div>
                        <div className=" text-lg">金额：¥100.00元</div>
                    </div>

                </div>
                <form className="flex mt-4 space-x-4 items-center">
                    <div className="form-control p-4 card">
                        <label className="label cursor-pointer flex gap-4">
                            <input type="radio" name="radio-10" className="radio radio-primary" />
                            <figure>
                                <img src="/productAssets/alipay.png" alt="alipay" />
                            </figure>
                        </label>
                    </div>
                    {/* <div className="form-control p-4 bg-base-200 card">
                        <label className="label cursor-pointer flex gap-4">
                            <input type="radio" name="radio-10" className="radio radio-primary" />
                            <span className="label-text">Blue pill</span>
                        </label>
                    </div> */}
                </form>
                <div className=" divider"></div>
                <div className="flex flex-row-reverse">
                    <button className="btn btn-primary btn-block md:btn-wide">付款</button>
                </div>

            </div>
        </>
    )
}