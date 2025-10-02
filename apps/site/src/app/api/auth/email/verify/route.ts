import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const upstream = await fetch(`${process.env.INTERNAL_API_BASE}/auth/email/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        redirect: "manual"
    });

    const res = new NextResponse(await upstream.text(), { status: upstream.status });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);
    const ct = upstream.headers.get("content-type"); if (ct) res.headers.set("content-type", ct);
    return res;
}
