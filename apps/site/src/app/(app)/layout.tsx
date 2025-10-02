import type { ReactNode } from "react";
import { getServerSession } from "@/core/session";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession();
    if (!session?.user) redirect("/login");
    return <div>{children}</div>;
}
