import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";
import es from "./locales/es/common.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "meditalk.lang";

const resources = {
    en: { translation: en },
    es: { translation: es }
} as const;

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        compatibilityJSON: "v3",
        interpolation: { escapeValue: false }
    });

AsyncStorage.getItem(STORAGE_KEY).then(code => {
    if (code && (code === "en" || code === "es")) i18n.changeLanguage(code);
});

export async function setLanguage(code: "en" | "es") {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
}

export default i18n;
