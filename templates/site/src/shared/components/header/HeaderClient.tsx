"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
// import { logout } from "./actions";
import { useUIStore } from "@/stores/ui";
import styles from "./Header.module.css";

type SessionUser = { id: string; email: string; name?: string; picture?: string };
type Session = { user: SessionUser } | null;

type Props = { session: Session };

export function HeaderClient({ session }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const user = session?.user;

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <button
                    aria-label="Toggle navigation"
                    className={styles.navToggle}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>

                <Link href="/" className={styles.brand}>
                    <span className={styles.brandMark} aria-hidden="true" />
                    <span className={styles.brandText}>meditalk</span>
                </Link>

                {/* Primary nav (desktop) */}
                <nav className={styles.nav}>
                    <Link href="/products" className={styles.navLink}>Products</Link>
                    <Link href="/categories" className={styles.navLink}>Categories</Link>
                    <Link href="/about" className={styles.navLink}>About</Link>
                </nav>

                <div className={styles.spacer} />

                {/* Right actions */}
                <div className={styles.actions}>
                    <Link href="/cart" className={styles.btnGhost}>Cart</Link>

                    {!user ? (
                        <Link href="/login" className={styles.btnPrimary}>Login</Link>
                    ) : (
                        <div className={styles.userMenuWrapper}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className={styles.userButton}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <UserAvatar name={user.name ?? user.email} picture={user.picture} />
                                <span className={styles.userName}>{user.name ?? user.email}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={styles.chevron}>
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className={styles.menu} role="menu">
                                    <Link
                                        href="/account"
                                        className={styles.menuItem}
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className={styles.menuItem}
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Orders
                                    </Link>
                                    {/* <button
                                        onClick={async () => {
                                            await logout();
                                            window.location.replace("/");
                                        }}
                                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                        role="menuitem"
                                    >
                                        Logout
                                    </button> */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function UserAvatar({ name, picture }: { name?: string; picture?: string }) {
    if (picture) {
        return (
            <Image
                src={picture}
                alt={name || "User"}
                width={28}
                height={28}
                className={styles.avatarImage}
            />
        );
    }
    const initials = (name || "?")
        .split(" ")
        .map((s) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("");
    return <span className={styles.avatarFallback}>{initials || "?"}</span>;
}
