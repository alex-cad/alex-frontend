import Image from 'next/image';
const products = [
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

export default function UserOrdersPage() {
    return (
        <div className='divide-y divide-slate-200'>
            {
                products.map((product, index) => (
                    <div className="mx-6 py-8 border-slate-200 text-slate-700">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="size-40 rounded object-cover"
                            priority={true}
                        />
                    </div>
                ))
            }
        </div>
    );
}