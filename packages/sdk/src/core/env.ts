export type Platform = "web" | "node" | "rn";

export function detectPlatform(): Platform {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") return "rn";
    if (typeof window !== "undefined" && typeof document !== "undefined") return "web";
    return "node";
}

export function userAgent(version = "0.1", platform: Platform = detectPlatform()) {
    return `SDK/${version} (${platform})`;
}
