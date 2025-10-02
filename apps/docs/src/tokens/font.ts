
import type { Token } from "./types";
export const fontFamilies: Token[] = [
  { key: "font-sans", cssVar: "--ds-font-sans", value: "ui-sans-serif, system-ui, Inter, Segoe UI, Roboto, Arial, sans-serif" },
  { key: "font-mono", cssVar: "--ds-font-mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" }
];
export const fontSizes: Token[] = [
  { key: "text-xs", cssVar: "--ds-text-xs", value: "clamp(0.75rem, 0.71rem + 0.20vw, 0.8125rem)" },
  { key: "text-sm", cssVar: "--ds-text-sm", value: "clamp(0.875rem, 0.83rem + 0.20vw, 0.9375rem)" },
  { key: "text-md", cssVar: "--ds-text-md", value: "clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)" },
  { key: "text-lg", cssVar: "--ds-text-lg", value: "clamp(1.125rem, 1.05rem + 0.40vw, 1.25rem)" },
  { key: "text-xl", cssVar: "--ds-text-xl", value: "clamp(1.25rem, 1.10rem + 0.80vw, 1.5rem)" },
  { key: "text-2xl", cssVar: "--ds-text-2xl", value: "clamp(1.5rem, 1.25rem + 1.20vw, 1.875rem)" },
  { key: "text-3xl", cssVar: "--ds-text-3xl", value: "clamp(1.875rem, 1.5rem + 1.8vw, 2.25rem)" }
];
