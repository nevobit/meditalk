type SessionUser = { id: string; email: string; name?: string; picture?: string };
export type Session = { user: SessionUser } | null;

export async function getServerSession(): Promise<Session> {
    try {
        const res = await fetch(`${process.env.INTERNAL_API_BASE}/auth/session`, {
            headers: { cookie: (await import("next/headers")).headers().then(h => h.get("cookie") || "") as unknown },
            cache: "no-store",
            redirect: "manual"
        });
        if (res.status === 200) return (await res.json()) as Session;
        return null;
    } catch {
        return null;
    }
}
