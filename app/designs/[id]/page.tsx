export default function Design({ params }: { params: { id: string } }) {
    return <div>My Post: {params.id}</div>
}