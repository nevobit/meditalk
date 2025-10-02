import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyMultipart from "@fastify/multipart";
import type { Logger } from "@mdi/core-modules";
import { version, name } from "../../package.json";
import os from "os";
import { verify, mapVerifyCode } from "@mdi/security";

type SwaggerOpts = Parameters<typeof fastifySwagger>[1];
type SwaggerUiOpts = Parameters<typeof fastifySwaggerUi>[1];
type CorsOpts = Parameters<typeof fastifyCors>[1];

export interface BuildAppOpts {
    logger: Logger | undefined;
    apiPrefix?: string;
    enableSwagger?: boolean;
    swaggerOptions?: SwaggerOpts;
    swaggerUiOptions?: SwaggerUiOpts;
    corsOptions?: CorsOpts;
    readiness?: () => Promise<{ ok: boolean; details?: Record<string, unknown> }>;
    environment?: "development" | "test" | "production";
}

const HEALTH_PATH = "/health-check";
const READY_PATH = "/-/ready";


export const buildApp = (opts: BuildAppOpts) => {
    const {
        logger,
        enableSwagger = false,
        swaggerOptions,
        swaggerUiOptions,
        corsOptions,
        readiness,
        environment = process.env.NODE_ENV ?? "development",
    } = opts;

    const app = fastify({
        logger: false,
        trustProxy: true,
        genReqId: (req) => {
            const raw =
                req.headers["x-request-id"] ??
                req.headers["x-correlation-id"];

            let id: string;

            if (Array.isArray(raw)) {
                id = raw[0] ?? "";
            } else {
                id = raw ?? "";
            }
            if (!id) {
                id = `req_${Math.random().toString(36).slice(2, 10)}`;
            }
            return id;
        },
        ajv: {
            customOptions: {
                removeAdditional: "all",
                coerceTypes: true,
                useDefaults: true,
                allErrors: false,
            },
        },
        requestTimeout: 60_000,
        connectionTimeout: 10_000,
        bodyLimit: 2 * 1024 * 1024,
    });

    app.register(fastifyCors, {
        origin: environment === "development" ? true : [/\.dominio\.com$/, /^https:\/\/(www\.)?dominio\.com$/],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        ...(corsOptions ?? {}),
    });

    app.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 5,
            fields: 50,
            fieldSize: 1024 * 1024,
        },
    });

    if (enableSwagger && swaggerOptions && swaggerUiOptions) {
        app.register(fastifySwagger, swaggerOptions);
        app.register(fastifySwaggerUi, swaggerUiOptions);
    }

    function getErrorMessage(err: unknown): string {
        if (err instanceof Error) return err.message;
        if (typeof err === "string") return err;
        try {
            return JSON.stringify(err);
        } catch {
            return "Unknown error";
        }
    }

    app.get(READY_PATH, async (_req, reply) => {
        if (!readiness) return { ok: true, note: "no readiness function provided" };
        try {
            const res = await readiness();
            if (!res.ok) reply.code(503);
            return res;
        } catch (err: unknown) {
            reply.code(503);
            return { ok: false, error: getErrorMessage(err) };
        }
    });

    const SKIP_PATHS = new Set([HEALTH_PATH, READY_PATH, "/docs", "/docs/json", "/docs/yaml"]);
    app.addHook("preValidation", async (req, reply) => {
        const path = req.url;

        if (SKIP_PATHS.has(path)) return;
        if (path.startsWith("/docs")) return;

        const TIMEOUT_MS = 3000;
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, rej) => {
            timeoutId = setTimeout(() => rej(new Error("verify_timeout")), TIMEOUT_MS);
        });

        try {
            const verifyPromise = verify({
                url: path,
                body: req.body,
                headers: req.headers,
                protocol: req.protocol,
                method: req.method,
            }) as Promise<{ type?: "error" | "ok"; message?: string; code?: number }>;

            const result = await Promise.race([verifyPromise, timeoutPromise]);

            clearTimeout(timeoutId);

            if ((result as { type?: "error" | "ok"; message?: string; code?: number })?.type === "error") {
                const r = result as { message?: string; code?: number; type?: string };
                const status = mapVerifyCode(r.code);
                req.log?.warn(
                    { requestId: req.id, status, reason: r.message, path },
                    "Verification failed",
                );
                return reply
                    .code(status)
                    .type("application/json")
                    .send({
                        type: r.type ?? "auth_error",
                        title: status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : "Bad Request",
                        status,
                        detail: r.message ?? "Verification failed",
                        instance: path,
                        requestId: req.id,
                    });
            }

        } catch (err: unknown) {
            clearTimeout(timeoutId);
            const isTimeout = getErrorMessage(err) === "verify_timeout";
            const status = isTimeout ? 504 : 500;

            req.log?.error(
                { requestId: req.id, path, err: isTimeout ? "verify_timeout" : getErrorMessage(err) },
                "Verification crash",
            );

            return reply.code(status).type("application/json").send({
                type: isTimeout ? "verify_timeout" : "verify_crash",
                title: isTimeout ? "Gateway Timeout" : "Internal Server Error",
                status,
                detail: isTimeout ? "Verification timed out" : "Verification threw an error",
                instance: path,
                requestId: req.id,
            });
        }
    });

    app.addHook("onRequest", async (req) => {
        if (process.env.NODE_ENV !== "production") {

            logger?.debug("Incoming request", {
                requestId: req.id,
                method: req.method,
                url: req.url,
                ip: req.ip,
            });
        }

    });


    app.setNotFoundHandler((req, reply) => {
        const problem = {
            type: "https://httpstatuses.com/404",
            title: "Resource Not Found",
            status: 404,
            detail: `No resource found for ${req.method} ${req.url}`,
            instance: req.url,
            method: req.method,
            requestId: req.id,
            service: {
                name,
                version,
                host: os.hostname(),
                env: process.env.NODE_ENV,
            },
            timestamp: new Date().toISOString(),
            hints: [
                "Check that the route is correct",
                "Make sure to use the /api/v1 prefix if applicable",
            ],
            docs: "https://domain.com/docs",
        };

        reply
            .code(404)
            .type("application/problem+json")
            .send(problem);
    });

    app.setErrorHandler((err, req, reply) => {
        const status =
            typeof (err).statusCode === "number" && (err).statusCode >= 400
                ? (err).statusCode
                : 500;

        logger?.error("Unhandled error", { err, requestId: req.id });

        reply.code(status).type("application/json").send({
            type: "about:blank",
            title: status >= 500 ? "Internal Server Error" : err.name || "Bad Request",
            status,
            detail: environment === "development" ? err.message : undefined,
            instance: req.url,
            requestId: req.id,
        });
    });

    return app;
};
