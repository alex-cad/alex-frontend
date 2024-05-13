import MyHeader from "@/app/ui/header";
import Link from "next/link";
import Footer from "@/app/ui/footer";
export default function Home() {
  return (
    <>
      <MyHeader className="" />
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6 ">Make Machine Made Simple!</p>
            <div className=" space-x-4">
              <Link className="btn" href="/user">进入用户主页</Link>
              <Link className="btn btn-primary" href="/user">开始设计</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
