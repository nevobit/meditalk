import { type PropsWithChildren, useEffect } from "react";
import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, STORAGE_KEYS } from "../config/constants";

async function loadNamespace(lng: string, ns: string) {
    const res = await fetch(`/locales/${lng}/${ns}.json`);
    if (!res.ok) throw new Error(`Missing i18n file: /locales/${lng}/${ns}.json`);
    return (await res.json()) as Record<string, unknown>;
}

async function ensureResources(lng: string, namespaces: string[]) {
    for (const ns of namespaces) {
        const has = i18n.hasResourceBundle(lng, ns);
        if (!has) {
            const data = await loadNamespace(lng, ns);
            i18n.addResourceBundle(lng, ns, data, true, true);
        }
    }
}

export function I18nProvider({ children }: PropsWithChildren) {
    useEffect(() => {
        const initialLng =
            localStorage.getItem(STORAGE_KEYS.locale) ||
            (navigator.language?.split("-")[0] ?? DEFAULT_LOCALE);

        const lng = SUPPORTED_LOCALES.includes(initialLng as unknown as 'es' | 'en' | 'pt') ? initialLng : DEFAULT_LOCALE;

        void i18n
            .use(initReactI18next)
            .init({
                lng,
                fallbackLng: DEFAULT_LOCALE,
                supportedLngs: SUPPORTED_LOCALES as unknown as string[],
                defaultNS: "common",
                ns: ["common"],
                interpolation: { escapeValue: false },
                debug: import.meta.env.VITE_I18N_DEBUG,
                resources: {},
            })
            .then(async () => {
                await ensureResources(lng, ["common"]);
            })
            .catch((e: Error) => {
                throw e;
            });
    }, []);

    return <I18nextProvider i18n={i18n}> {children} </I18nextProvider>;
}
