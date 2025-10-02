import type { Platform } from "./env";

export type SdkOptions = {
    baseUrl: string;
    apiKey: string;
    /**
     * Inject a stable version string for User-Agent (defaults to 0.1)
     */
    version?: string;
    /**
     * Force platform if auto-detection is not desired
     */
    platform?: Platform;
    /**
     * Optional global headers to send in every request
     */
    headers?: Record<string, string>;
    /**
     * Optional fetch implementation override (for testing)
     */
    fetch?: typeof fetch;
    /**
     * Optional retry policy
     */
    retry?: {
        maxRetries?: number;    // default 2
        baseDelayMs?: number;   // default 200
    };
};

export type RequestInitLite = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};
