"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./Sidebar.module.css";
import { useUIStore } from "@/stores/ui";
import { logout } from "../header/actions";

type SessionUser = { id: string; email: string; name?: string; picture?: string };
type Session = { user: SessionUser } | null;
type Props = { session: Session };

export function SidebarClient({ session }: Props) {
    const sidebarOpen = useUIStore((s) => s.sidebarOpen);
    const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setSidebarOpen(false);
        }
        if (sidebarOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sidebarOpen, setSidebarOpen]);

    // Scroll lock
    useEffect(() => {
        if (!sidebarOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; };
    }, [sidebarOpen]);

    // Focus first interactive element when open
    useEffect(() => {
        if (!sidebarOpen) return;
        const el = panelRef.current?.querySelector<HTMLElement>("a,button,input,select,textarea,[tabindex]");
        el?.focus();
    }, [sidebarOpen]);

    const user = session?.user;

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${sidebarOpen ? styles.show : ""}`}
                aria-hidden={!sidebarOpen}
                onClick={() => setSidebarOpen(false)}
            />
            {/* Panel */}
            <aside
                className={`${styles.panel} ${sidebarOpen ? styles.open : ""}`}
                aria-hidden={!sidebarOpen}
                aria-label="Sidebar navigation"
                ref={panelRef}
            >
                <div className={styles.header}>
                    <span className={styles.brandMark} aria-hidden="true" />
                    <span className={styles.brandText}>meditalk</span>
                    <button
                        className={styles.closeBtn}
                        aria-label="Close sidebar"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ×
                    </button>
                </div>

                <nav className={styles.section}>
                    <h3 className={styles.sectionTitle}>Browse</h3>
                    <Link href="/products" className={styles.link} onClick={() => setSidebarOpen(false)}>Products</Link>
                    <Link href="/categories" className={styles.link} onClick={() => setSidebarOpen(false)}>Categories</Link>
                    <Link href="/about" className={styles.link} onClick={() => setSidebarOpen(false)}>About</Link>
                </nav>

                {!user ? (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Account</h3>
                        <Link href="/login" className={styles.buttonPrimary} onClick={() => setSidebarOpen(false)}>
                            Login
                        </Link>
                    </div>
                ) : (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>My Account</h3>
                        <Link href="/account" className={styles.link} onClick={() => setSidebarOpen(false)}>Profile</Link>
                        <Link href="/orders" className={styles.link} onClick={() => setSidebarOpen(false)}>Orders</Link>
                        <button
                            className={`${styles.link} ${styles.danger}`}
                            onClick={async () => {
                                await logout();
                                window.location.replace("/");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}

                <div className={styles.footer}>
                    <Link href="/cart" className={styles.link} onClick={() => setSidebarOpen(false)}>Cart</Link>
                    <Link href="/contact" className={styles.link} onClick={() => setSidebarOpen(false)}>Contact</Link>
                </div>
            </aside>
        </>
    );
}
