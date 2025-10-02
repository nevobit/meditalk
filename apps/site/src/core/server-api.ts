import { headers } from "next/headers";

export async function serverApiFetch<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const h = await headers();
    const cookie = h.get("cookie") || "";

    const res = await fetch(`${process.env.INTERNAL_API_BASE}${path}`, {
        ...init,
        headers: {
            "content-type": "application/json",
            cookie,
            ...(init?.headers || {})
        },
        cache: "no-store",
        redirect: "manual"
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`UPSTREAM (${res.status}): ${text || res.statusText}`);
    }
    return res.json() as Promise<T>;
}
