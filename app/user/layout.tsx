import MyHeader from "@/app/ui/header";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <MyHeader/>

            <div className='main-content'>
                {children}
            </div>
        </>
    );
}