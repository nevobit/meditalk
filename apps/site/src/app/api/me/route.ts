import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const cookie = req.headers.get("cookie") || "";
    const res = await fetch(`${process.env.INTERNAL_API_BASE}/auth/session`, {
        headers: { cookie },
        cache: "no-store"
    });
    if (!res.ok) return NextResponse.json({ user: null }, { status: 401 });
    const data = await res.json();
    return NextResponse.json(data);
}
