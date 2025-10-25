import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar"
import {
    Plus,
    Search,
    FileText,
    Pencil,
    Mic,
    CreditCard,
} from "lucide-react";
import styles from "./Layout.module.css";
import { useSession } from "@/shared";

const Layout = () => {
    const { user } = useSession();

    return (
        <div className={styles.container} >
            <Sidebar
                orgName="Family Medicine"
                orgLogoUrl="/org-logo.png"
                userName={user?.name ?? ""}
                userAvatarUrl={user?.avatar}
                defaultCollapsed={false}
                groups={[
                    {
                        id: "quick",
                        items: [
                            { key: "new", label: "Nuevo", icon: Plus, href: "/", title: "Nuevo" },
                            { key: "search", label: "Buscar", icon: Search, href: "/search", title: "Buscar" },
                        ],
                    },
                    {
                        id: "main",
                        items: [
                            { key: "recording", label: "Grabación", icon: Mic, href: "/" },
                            { key: "docs", label: "Mis Informes", icon: FileText, href: "/informs" },
                            { key: "inbox", label: "Personalización", icon: Pencil, href: "/inbox" },
                            { key: "billing", label: "Suscripción", icon: CreditCard, href: "/patients" },
                        ],
                    },
                ]}
            />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout