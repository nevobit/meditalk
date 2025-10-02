import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.redirect(`${process.env.INTERNAL_API_BASE}/auth/google/start`, { status: 302 });
}
