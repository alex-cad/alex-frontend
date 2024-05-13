import Link from "next/link";
import config from "@/app/config";

export default function Footer({ className = "" }) {
    return (
        <>
            <footer className="footer p-10 bg-base-200 text-base-content">
                <nav>
                    <h6 className="footer-title">Services</h6>
                    <a className="link link-hover">Branding</a>
                    <a className="link link-hover">Design</a>
                    <a className="link link-hover">Marketing</a>
                    <a className="link link-hover">Advertisement</a>
                </nav>
                <nav>
                    <h6 className="footer-title">Company</h6>
                    <a className="link link-hover">About us</a>
                    <a className="link link-hover">Contact</a>
                    <a className="link link-hover">Jobs</a>
                    <a className="link link-hover">Press kit</a>
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    <a className="link link-hover">Terms of use</a>
                    <a className="link link-hover">Privacy policy</a>
                    <a className="link link-hover">Cookie policy</a>
                </nav>
            </footer>
            <footer className="footer footer-center px-10 py-4 bg-base-200 text-base-content">
                <div className="flex gap-4">
                    <div>LOGO</div>
                    <div>Copyright © {new Date().getFullYear()} - All right reserved by {config.company_name}</div>
                </div>
                <Link className="link" href="">粤ICP备案号：XXXXXXX</Link>
            </footer>
        </>
    )
}