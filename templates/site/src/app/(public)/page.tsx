import { getServerSession } from "@/core/session";
import Link from "next/link";

export default async function HomePage() {
    const session = await getServerSession();
    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            {session?.user ? (
                <div className="mt-4">
                    <p>Hi, {session.user.email}!</p>
                    <Link href="/account" className="underline">Go to Account</Link>
                </div>
            ) : (
                <div className="mt-4">
                    <p>You are not logged in.</p>
                    <Link href="/login" className="underline">Login</Link>
                </div>
            )}
        </main>
    );
}
