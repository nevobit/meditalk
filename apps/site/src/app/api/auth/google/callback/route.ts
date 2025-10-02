import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.search;
    const upstream = await fetch(`${process.env.INTERNAL_API_BASE}/auth/google/callback${q}`, {
        method: "GET",
        redirect: "manual"
    });

    const location = upstream.headers.get("location") || "/";
    const res = NextResponse.redirect(location, { status: upstream.status === 302 ? 302 : 303 });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
}
