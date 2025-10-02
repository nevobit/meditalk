export const LANGS = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" }
] as const;

export type LangCode = typeof LANGS[number]["code"];
