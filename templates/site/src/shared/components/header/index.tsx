import { getServerSession } from "@/core/session";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
    const session = await getServerSession();
    return <HeaderClient session={session} />;
}
