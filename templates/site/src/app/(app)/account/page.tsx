import { getServerSession } from "@/core/session";

export default async function AccountPage() {
    const session = await getServerSession();
    return (
        <main className="p-6 grid gap-3">
            <h1 className="text-2xl font-semibold">My Account</h1>
            <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(session, null, 2)}</pre>
            <form action="/api/auth/logout" method="post">
            </form>
        </main>
    );
}
