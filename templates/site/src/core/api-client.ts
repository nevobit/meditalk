export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        ...init,
        headers: {
            "content-type": "application/json",
            ...(init?.headers || {})
        },
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API (${res.status}): ${text || res.statusText}`);
    }
    return res.json() as Promise<T>;
}
