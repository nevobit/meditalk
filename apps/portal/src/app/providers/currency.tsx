import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, STORAGE_KEYS, type CurrencyCode } from "../config/constants";

const LOCALE_TO_CURRENCY: Record<string, CurrencyCode> = {
    es: "COP",
    "es-CO": "COP",
    en: "USD",
    "en-US": "USD",
    pt: "EUR",
};

type CurrencyCtx = {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    format: (n: number, opts?: Intl.NumberFormatOptions) => string;
};

const CurrencyContext = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: PropsWithChildren) {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.currency) as CurrencyCode | null;
        if (saved && SUPPORTED_CURRENCIES.includes(saved)) return saved;
        const nav = navigator.language || "es";
        const suggested = LOCALE_TO_CURRENCY[nav] ?? LOCALE_TO_CURRENCY[nav.split("-")[0]] ?? DEFAULT_CURRENCY;
        return suggested;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.currency, currency);
    }, [currency]);

    const setCurrency = (c: CurrencyCode) => {
        if (!SUPPORTED_CURRENCIES.includes(c)) return;
        setCurrencyState(c);
    };

    const format = useMemo(() => {
        return (n: number, opts?: Intl.NumberFormatOptions) =>
            new Intl.NumberFormat(undefined, { style: "currency", currency, ...opts }).format(n);
    }, [currency]);

    const value = useMemo(() => ({ currency, setCurrency, format }), [currency, format]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrencyCtx() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("CurrencyContext not found");
    return ctx;
}
