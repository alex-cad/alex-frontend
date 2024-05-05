export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className=" flex">
            <div className="w-1/4 bg-gray-800">
                <div className="text-white">Sidebar</div>
            </div>
            <div>{children}</div>
        </div>
    );
}