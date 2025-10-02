export type RateInfo = {
    remaining?: number;
    resetAt?: string;
};

export function parseRateHeaders(h: Headers): RateInfo {
    const remaining = h.get("x-ratelimit-remaining");
    const resetAt = h.get("x-ratelimit-reset");
    return {
        remaining: remaining != null ? Number(remaining) : undefined,
        resetAt: resetAt ?? undefined
    };
}
