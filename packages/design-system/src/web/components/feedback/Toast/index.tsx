import React, { createContext, useContext, useMemo, useState } from "react";
import styles from "./Toast.module.css";
import { Portal } from "../../utilities";
import { cx } from "../../../../utils/cx";

type ToastItem = { id: string; text: string; duration?: number };
type Ctx = { push: (text: string, duration?: number) => void };
const ToastCtx = createContext<Ctx | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
    return ctx;
};

export const ToastProvider: React.FC<{ children?: React.ReactNode; placement?: "top-right" | "bottom-right" | "top-left" | "bottom-left" }> = ({ children, placement = "top-right" }) => {
    const [items, setItems] = useState<ToastItem[]>([]);
    const push = (text: string, duration = 3000) => {
        const id = Math.random().toString(36).slice(2);
        setItems(prev => [...prev, { id, text, duration }]);
        window.setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), duration);
    };
    const ctx = useMemo(() => ({ push }), []);
    return (
        <ToastCtx.Provider value={ctx}>
            {children}
            <Portal>
                <div className={cx(styles.stack, styles[placement])} aria-live="polite" role="status">
                    {items.map(i => <div key={i.id} className={styles.toast}>{i.text}</div>)}
                </div>
            </Portal>
        </ToastCtx.Provider>
    );
};
