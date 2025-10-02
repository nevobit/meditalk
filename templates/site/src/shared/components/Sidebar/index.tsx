import { getServerSession } from "@/core/session";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
    const session = await getServerSession();
    return <SidebarClient session={session} />;
}
