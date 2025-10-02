import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const upstream = await fetch(`${process.env.INTERNAL_API_BASE}/auth/email/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    });
    const text = await upstream.text();
    return new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") || "application/json" }
    });
}
