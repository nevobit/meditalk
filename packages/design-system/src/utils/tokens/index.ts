export type DsTokens = {
    space: Record<string, number>;
    radius: Record<string, number>;
    zIndex: Record<string, number>;
    font: { sans: string; mono: string; size: Record<string, number> };
    color: Record<string, string>;
};

export const jsTokens: DsTokens = {
    space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 },
    radius: { 0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 12: 12 },
    zIndex: { 0: 0, 1: 10, 2: 100, 3: 1000, 4: 10000 },
    font: {
        sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, Roboto, Arial, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
        size: { 12: 12, 14: 14, 16: 16, 18: 18, 20: 20, 24: 24, 30: 30, 36: 36 }
    },
    color: {
        accent: "var(--ds-accent)",
        fg: "var(--ds-fg-default)",
        bg: "var(--ds-bg-canvas)"
    }
};

export const cssVar = (name: string, fallback?: string) =>
    `var(${name}${fallback ? `, ${fallback}` : ""})`;
