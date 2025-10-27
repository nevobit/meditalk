import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, User, Settings, Wifi, WifiOff } from "lucide-react";
import styles from "./Sidebar.module.css";
import type { SidebarGroup, SidebarItem } from "./types";
import { Avatar } from "@mdi/design-system";
import { useSession } from "@/shared";
import { useNavigate } from "react-router-dom";

type Props = {
    orgName: string;
    orgLogoUrl?: string;
    userName?: string;
    userAvatarUrl?: string;
    groups: SidebarGroup[];
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (v: boolean) => void;
    storageKey?: string;
};

const IconWrap = ({ icon: Icon, className }: { icon: SidebarItem["icon"]; className?: string }) => {
    if (typeof Icon === "function" && (Icon as unknown as { name?: string }).name !== "") {
        return <Icon className={className} size={18} strokeWidth='9.5' />;
    }
    return <Icon className={className} />;
};

export default function Sidebar({
    orgName,
    orgLogoUrl,
    userName,
    userAvatarUrl,
    groups,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    storageKey = "ui.sidebar.collapsed",
}: Props) {
    const isControlled = typeof controlledCollapsed === "boolean";
    const [localCollapsed, setLocalCollapsed] = useState<boolean>(defaultCollapsed);
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { signOut } = useSession();

    useEffect(() => {
        if (isControlled) return;
        const saved = window.localStorage.getItem(storageKey);
        if (saved != null) setLocalCollapsed(saved === "1");
    }, [isControlled, storageKey]);

    // Cerrar menú de usuario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    // Monitorear estado de conexión
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const collapsed = isControlled ? (controlledCollapsed as boolean) : localCollapsed;

    const setCollapsed = (v: boolean) => {
        if (!isControlled) {
            setLocalCollapsed(v);
            window.localStorage.setItem(storageKey, v ? "1" : "0");
        }
        onCollapsedChange?.(v);
    };

    const chevDir = collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;

    const navigate = useNavigate();
    const handleSignOut = () => {
        setUserMenuOpen(false);
        signOut();
        navigate("/signin");
    };

    return (
        <aside className={`${styles.wrap} ${collapsed ? styles.collapsed : ""}`} aria-label="Sidebar">
            <div className={styles.inner}>
                <div className={styles.header} title={orgName}>
                    <Avatar src={orgLogoUrl} name={orgName} size="xs" shape="rounded" />
                    {!collapsed && (
                        <>
                            <div className={styles.orgName}>{orgName}</div>
                            <span className={styles.chev} aria-hidden>
                                <ChevronDown size={16} />
                            </span>
                        </>
                    )}
                </div>

                <nav aria-label="Main">
                    {groups.map((g, idx) => (
                        <div key={g.id} className={styles.section} style={g.gutterTop ? { marginTop: 8 } : undefined}>
                            {idx === 1 && <hr className={styles.sep} />}
                            <div className={styles.list}>
                                {g.items.map((it) => {
                                    const ItemContent = (
                                        <>
                                            <IconWrap icon={it.icon} className={styles.icon} />
                                            {!collapsed && <span className={styles.label}>{it.label}</span>}
                                            {!!it.badge && !collapsed && <span className={styles.badge}>{it.badge}</span>}
                                        </>
                                    );

                                    const commonProps = {
                                        className: `${styles.item} ${it.active ? styles.active : ""}`,
                                        title: collapsed ? (it.title || it.label) : undefined,
                                        "aria-current": it.active ? "page" : undefined,
                                    } as const;

                                    return it.href ? (
                                        <a key={it.key} href={it.href} {...commonProps}>
                                            {ItemContent}
                                        </a>
                                    ) : (
                                        <button
                                            key={it.key}
                                            type="button"
                                            onClick={it.onClick}
                                            {...commonProps}
                                                style={{ textAlign: "left" }}
                                        >
                                            {ItemContent}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <div className={styles.userContainer} ref={userMenuRef}>
                        <button
                            className={`${styles.user} ${!isOnline ? styles.userOffline : ''}`}
                            title={userName}
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className={styles.avatarContainer}>
                                <Avatar src={userAvatarUrl} name={userName} size="sm" />
                                {!isOnline && <div className={styles.offlineIndicator}></div>}
                            </div>
                            {!collapsed && <span className={styles.userName}>{userName}</span>}
                            {!collapsed && <ChevronDown size={14} className={`${styles.userChevron} ${userMenuOpen ? styles.open : ''}`} />}
                        </button>

                        {userMenuOpen && (
                            <div className={styles.userMenu}>
                                <div className={styles.userMenuHeader}>
                                    <Avatar src={userAvatarUrl} name={userName} size="md" />
                                    <div className={styles.userInfo}>
                                        <div className={styles.userInfoName}>{userName}</div>
                                        <div className={styles.userInfoEmail}>usuario@meditalk.com</div>
                                        <div className={styles.connectionStatus}>
                                            {isOnline ? (
                                                <><Wifi size={12} className={styles.connectionIcon} /> Conectado</>
                                            ) : (
                                                <><WifiOff size={12} className={styles.connectionIcon} /> Sin conexión</>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.userMenuSeparator}></div>

                                <div className={styles.userMenuItems}>
                                    <button className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                                        <User size={16} />
                                        <span>Perfil</span>
                                    </button>
                                    <button className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                                        <Settings size={16} />
                                        <span>Configuración</span>
                                    </button>
                                </div>

                                <div className={styles.userMenuSeparator}></div>

                                <button className={`${styles.userMenuItem} ${styles.userMenuItemDanger}`} onClick={handleSignOut}>
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="button"
                className={styles.collapseBtn}
                aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
                onClick={() => setCollapsed(!collapsed)}
            >
                {chevDir}
            </button>
        </aside>
    );
}
