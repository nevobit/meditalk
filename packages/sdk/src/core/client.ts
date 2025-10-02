import axios, { AxiosInstance } from "axios";
import { detectPlatform, userAgent } from "./env";
import { makeError, type SdkError } from "./errors";
import { parseRateHeaders, type RateInfo } from "./rate";
import type { SdkOptions, RequestInitLite } from "./types";

/**
 * Create a thin HTTP client over fetch with:
 * - API Key header
 * - Stable User-Agent
 * - Idempotency-Key support
 * - Retry w/ backoff on transient errors (429/5xx/network)
 * - Normalized error mapping
 * - RateLimit info extraction
 */

export const createClient = (opts: SdkOptions): AxiosInstance => {
    const platform = opts.platform ?? detectPlatform();
    const agent = userAgent(opts.version ?? "0.1", platform);
    // const retryCfg = { maxRetries: opts.retry?.maxRetries ?? 2, base: opts.retry?.baseDelayMs ?? 200 };

    if (!opts.apiKey) {
        throw makeError({ code: "AUTH_REQUIRED", message: "API Key is required" });
    }

    const baseHeaders = {
        "api-key": opts.apiKey,
        "User-Agent": agent,
        "X-Client-User-Agent": agent,
        "Content-Type": "application/json",
        ...opts.headers
    };

    const client = axios.create({
        baseURL: opts.baseUrl,
        headers: baseHeaders,
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
    });

    return client;
}


export function createHttpClient(opts: SdkOptions) {
    const platform = opts.platform ?? detectPlatform();
    const agent = userAgent(opts.version ?? "0.1", platform);
    const fetchImpl = opts.fetch ?? fetch;
    const retryCfg = { maxRetries: opts.retry?.maxRetries ?? 2, base: opts.retry?.baseDelayMs ?? 200 };

    const baseHeaders = {
        "Authorization": `Bearer ${opts.apiKey}`,
        "User-Agent": agent,
        "X-Client-User-Agent": agent,
        "Content-Type": "application/json",
        ...opts.headers
    };

    function sleep(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    function isRetriable(status?: number) {
        return status === 429 || (status != null && status >= 500);
    }

    async function request<T>(
        method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
        path: string,
        init: RequestInitLite = {}
    ): Promise<{ data: T; rate: RateInfo; requestId?: string; status: number; headers: Headers }> {
        if (!opts.apiKey) {
            throw makeError({ code: "AUTH_REQUIRED", message: "API Key is required" });
        }

        const url = path.startsWith("http") ? path : `${opts.baseUrl.replace(/\/$/, "")}${path}`;
        const headers = { ...baseHeaders, ...(init.headers ?? {}) };

        let attempt = 0;
        while (true) {
            try {
                const res: Response = await fetchImpl(url, { ...init, method, headers });
                const headersObj = res.headers;
                const reqId = res.headers.get("x-request-id") ?? undefined;
                const rate = parseRateHeaders(headersObj);
                const status = res.status;

                const text = await res.text();
                const body = text ? safeJson(text) : undefined;

                if (res.ok) {
                    return { data: body as T, rate, requestId: reqId, status, headers: res.headers };
                }

                const mapped = mapError(status, body, reqId);
                if (isRetriable(status) && attempt < retryCfg.maxRetries) {
                    attempt++;
                    const delay = retryCfg.base * attempt;
                    await sleep(delay);
                    continue;
                }
                throw mapped;
            } catch (err: unknown) {
                if (isSdkError(err)) throw err;
                if (attempt < retryCfg.maxRetries) {
                    attempt++;
                    const delay = retryCfg.base * attempt;
                    await sleep(delay);
                    continue;
                }
                throw makeError({ code: "NETWORK_ERROR", message: (err as Error)?.message ?? "Network error", details: err });
            }
        }
    }

    return {
        get: <T>(path: string, init?: RequestInitLite) => request<T>("GET", path, init),
        post: <T>(path: string, body?: unknown, init?: RequestInitLite) =>
            request<T>("POST", path, { ...init, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
        patch: <T>(path: string, body?: unknown, init?: RequestInitLite) =>
            request<T>("PATCH", path, { ...init, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
        put: <T>(path: string, body?: unknown, init?: RequestInitLite) =>
            request<T>("PUT", path, { ...init, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
        delete: <T>(path: string, init?: RequestInitLite) => request<T>("DELETE", path, init)
    };
}

function isSdkError(e: unknown): e is SdkError {
    return !!e && typeof e === "object" && "code" in e && "message" in e;
}

function safeJson(s: string) {
    try { return JSON.parse(s); } catch { return s as unknown; }
}
function mapError(status: number, body: unknown, requestId?: string): SdkError {
    const maybeObj = body as Record<string, unknown> | null | undefined;
    const serverCode = typeof maybeObj?.code === "string" ? maybeObj.code : undefined;
    const message =
        typeof maybeObj?.message === "string"
            ? maybeObj.message
            : status >= 500
                ? "Server error"
                : "Request failed";

    const fromServer = (code: string): SdkError => ({
        code: mapServerCode(code),
        message,
        status,
        requestId,
        details: body
    });

    if (serverCode) return fromServer(serverCode);

    if (status === 401)
        return { code: "AUTH_REQUIRED", message, status, requestId, details: body };
    if (status === 403)
        return { code: "FORBIDDEN", message, status, requestId, details: body };
    if (status === 404)
        return { code: "RESOURCE_NOT_FOUND", message, status, requestId, details: body };
    if (status === 409)
        return { code: "CONFLICT", message, status, requestId, details: body };
    if (status === 422)
        return { code: "VALIDATION_ERROR", message, status, requestId, details: body };
    if (status === 429)
        return { code: "RATE_LIMIT_EXCEEDED", message, status, requestId, details: body };
    if (status >= 500)
        return { code: "SERVER_ERROR", message, status, requestId, details: body };

    return { code: "UNKNOWN", message, status, requestId, details: body };
}

function mapServerCode(code: string) {
    switch (code) {
        case "RATE_LIMIT_EXCEEDED": return "RATE_LIMIT_EXCEEDED";
        case "RESOURCE_NOT_FOUND": return "RESOURCE_NOT_FOUND";
        case "RESOURCE_ALREADY_EXISTS": return "RESOURCE_ALREADY_EXISTS";
        case "VALIDATION_MISSING_FIELD":
        case "VALIDATION_ERROR": return "VALIDATION_ERROR";
        case "AUTH_FORBIDDEN": return "FORBIDDEN";
        case "CONFLICT": return "CONFLICT";
        default: return "UNKNOWN";
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        globalThis.setTimeout(resolve, ms);
    });
}
