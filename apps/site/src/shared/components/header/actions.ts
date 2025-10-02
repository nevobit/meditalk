"use server";

export async function logout() {
    const res = await fetch(`${process.env.APP_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Logout failed");
}
