export type RateSnapshot = {
    remaining: number;
    resetAt: string;
};

export const ensureNotLimited = (snap: RateSnapshot): void => {
    if (snap.remaining <= 0) {
        const e = new Error("Rate limit exceeded");
        (e as Error & { code: string }).code = "RATE_LIMIT_EXCEEDED";
        (e as Error & { resetAt: string }).resetAt = snap.resetAt;
        throw e;
    }
};

export const isLimited = (snap: RateSnapshot): boolean =>
    snap.remaining <= 0;
