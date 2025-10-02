export type VerifyOk = { type: "ok"; message?: string; code?: number };
export type VerifyErr = { type: "error"; message?: string; code?: number };
export type VerifyResult = VerifyOk | VerifyErr;

const ALLOWED_PRODUCTS = [
    "GSDK",
    "Portal",
    "Admin",
    "Mobile",
    "Site",
    "CLI",
    "Graph",
    "Ops",
    "Worker",
    "Edge",
] as const;

const ALLOWED_PLATFORMS = ["web", "node", "rn", "next", "cli"] as const;

const PRODUCT_GROUP = ALLOWED_PRODUCTS.join("|");
const PLATFORM_GROUP = ALLOWED_PLATFORMS.join("|");
const VERSION_RE = "\\d+(?:\\.\\d+)*";
const UA_REGEX = new RegExp(
    `^(${PRODUCT_GROUP})/${VERSION_RE}\\s+\\((${PLATFORM_GROUP})(?:;[^)]*)?\\)$`,
    "i"
);

export type VerifyInput = {
    ip?: string;
    url: string;
    method: string;
    body: unknown;
    headers: Record<string, unknown>;
    protocol?: string;
};

export const VerifyCode = {
    OK: 0,

    MISSING_API_KEY: 1001,
    INVALID_API_KEY: 1002,
    FORBIDDEN: 1003,

    BAD_USER_AGENT: 1101,
    INVALID_SIGNATURE: 1102,
    BAD_REQUEST: 1103,
    MISSING_TIMESTAMP: 1104,
    SKEWED_TIMESTAMP: 1105,
    MISSING_PATH: 1106,
    PATH_MISMATCH: 1107,
    MISSING_SIGNATURE: 1108,

    RATE_LIMITED: 1201,
    REPLAY_NONCE: 1202,

    UPSTREAM_UNAVAILABLE: 1301,
} as const;
export type VerifyCode = (typeof VerifyCode)[keyof typeof VerifyCode];

type Checker = (input: VerifyInput) => Promise<VerifyErr | null> | (VerifyErr | null);

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const TIMESTAMP_HEADER = "x-timestamp";
const PATH_HEADER = "x-path";
const NONCE_HEADER = "x-nonce";

function parseHeaderString(h: unknown): string {
    return typeof h === "string" ? h : String(h ?? "");
}

function parseIntMs(h: unknown): number | null {
    const s = parseHeaderString(h).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}


const requireApiKey: Checker = (input) => {
    const apiKey = parseHeaderString(input.headers["api-key"]);
    if (!apiKey) {
        return { type: "error", code: VerifyCode.MISSING_API_KEY, message: "Missing api-key header" };
    }
    if (apiKey.length < 20) {
        return { type: "error", code: VerifyCode.INVALID_API_KEY, message: "Malformed API key" };
    }
    return null;
};

const requireUserAgent: Checker = (input) => {
    const ua = parseHeaderString(input.headers["x-client-agent"] ?? input.headers["X-Client-Agent"]);
    const xua = parseHeaderString(input.headers["x-client-user-agent"]);
    const agent = ua || xua;
    if (!agent) {
        return { type: "error", code: VerifyCode.BAD_USER_AGENT, message: "Missing User-Agent" };
    }
    if (!UA_REGEX.test(agent)) {
        return {
            type: "error",
            code: VerifyCode.BAD_USER_AGENT,
            message: "Invalid User-Agent format. Expected: Product/Version (platform[; extras]).",
        };
    }
    return null;
};

const requireTimestamp: Checker = (input) => {
    const ts = parseIntMs(input.headers[TIMESTAMP_HEADER]);
    if (ts === null) {
        return { type: "error", code: VerifyCode.MISSING_TIMESTAMP, message: `Missing ${TIMESTAMP_HEADER}` };
    }
    const now = Date.now();
    const delta = Math.abs(now - ts);
    if (delta > MAX_CLOCK_SKEW_MS) {
        return {
            type: "error",
            code: VerifyCode.SKEWED_TIMESTAMP,
            message: `Timestamp skew too large (±${MAX_CLOCK_SKEW_MS}ms)`,
        };
    }
    return null;
};

const requirePath: Checker = (input) => {
    const xPath = parseHeaderString(input.headers[PATH_HEADER]);
    if (!xPath) {
        return { type: "error", code: VerifyCode.MISSING_PATH, message: `Missing ${PATH_HEADER}` };
    }
    if (xPath !== input.url) {
        return {
            type: "error",
            code: VerifyCode.PATH_MISMATCH,
            message: `X-Path mismatch`,
        };
    }
    return null;
};


const checkNonceIfPresent =
    (_existsOnce: (nonce: string) => Promise<boolean> | boolean = async () => true): Checker =>
        async (input) => {
            const nonce = parseHeaderString(input.headers[NONCE_HEADER]);
            if (!nonce) return null;
            const ok = await _existsOnce(nonce); // true si es la primera vez, false si ya se usó
            if (!ok) {
                return { type: "error", code: VerifyCode.REPLAY_NONCE, message: "Replay detected (nonce reused)" };
            }
            return null;
        };


const requests = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000; // 1 min
const LIMIT = 100;

export const checkRateLimit: Checker = async (input) => {
    const key = input.headers["api-key"] ?? input.ip;
    if (!key) return null;

    const now = Date.now();
    const record = requests.get(key as string);

    if (!record || record.reset < now) {
        requests.set(key as string, { count: 1, reset: now + WINDOW_MS });
        return null;
    }

    if (record.count >= LIMIT) {
        return {
            type: "error",
            code: VerifyCode.RATE_LIMITED,
            message: "Rate limit exceeded"
        };
    }

    record.count++;
    return null;
};

const CHECKS: Checker[] = [
    requireApiKey,
    requireUserAgent,
    requireTimestamp,
    requirePath,
    // verifyHmacSignature,
    checkNonceIfPresent(),
    checkRateLimit,
];

export async function verify(input: VerifyInput): Promise<VerifyResult> {
    for (const check of CHECKS) {
        const res = await Promise.resolve(check(input));
        if (res) return res;
    }
    return { type: "ok", code: VerifyCode.OK };
}
