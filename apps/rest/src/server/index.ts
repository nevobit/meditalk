import os from "os";
import "dotenv/config";
import { version, name } from "../../package.json";
import {
  ConsoleTransport,
  Logger,
  LoggerTransportName,
  MonoContext,
} from "@mdi/core-modules";
import { setLogger, setMailer } from "@mdi/constant-definitions";
import { swaggerOptions, swaggerUiOptions } from "../docs";
import { buildApp } from "./app";
import { registerRoutes } from "@/routes";
import { initDataSources } from '@mdi/data-sources';
import { createMailer } from "@mdi/integrations";

const { env } = process

const consoleOptions = {
  transport: LoggerTransportName.CONSOLE,
  options: {
    destination: LoggerTransportName.CONSOLE,
    channelName: LoggerTransportName.CONSOLE,
  },
};

const logger = new Logger({
  optionsByLevel: {
    debug: [consoleOptions],
    info: [consoleOptions],
    warn: [consoleOptions],
    error: [consoleOptions],
    fatal: [consoleOptions],
    all: [consoleOptions],
    raw: [consoleOptions],
  },
  transports: { [LoggerTransportName.CONSOLE]: ConsoleTransport },
  appIdentifiers: {
    region: env.REGION,
    clusterType: "",
    hostname: os.hostname(),
    app: name,
    version,
    environment: env.ENVIRONMENT ?? env.NODE_ENV,
    developer: os.userInfo().username,
  },
  catchTransportErrors: true,
  logLevel: "all",
});

setLogger(logger);
MonoContext.setState({ version, secret: null });

const mailer = createMailer({
  provider: "resend",
  from: process.env.EMAIL_FROM!,
  replyTo: process.env.EMAIL_REPLY_TO!,
  RESEND_API_KEY: env.RESEND_API_KEY!,
});

setMailer(mailer);


async function readiness() {
  // TODO: return real status (mongo/redis)
  return { ok: true, details: { mongo: Boolean(env.MONGO_URL), redis: Boolean(env.REDIS_URL) } };
}

console.log("env.REDIS_URL", env.REDIS_URL);
async function main() {
  await initDataSources({
    // api: [{
    //   apiBaseUrl: env.API_URL!,
    //   apiName: "api",
    //   apiSecret: env.API_SECRET!
    // }
    // ],
    mongoose: {
      mongoUrl: env.MONGO_URI
    },
    // postgresqldb: {
    //   postgresUrl: env.DATABASE_URL,
    // },
    redisdb: {
      redisReadUrl: env.REDIS_URL,
      redisWriteUrl: env.REDIS_URL,
    },
  });


  const server = buildApp({
    logger: logger,
    enableSwagger: env.ENABLE_SWAGGER === "true",
    swaggerOptions,
    swaggerUiOptions,
    readiness,
    environment: env.NODE_ENV as "development" | "test" | "production" | undefined,
    corsOptions: {
      origin: env.NODE_ENV === "development" ? true : [/\.dominio\.com$/, /^https:\/\/(www\.)?dominio\.com$/],
    },
  });

  server.register(registerRoutes, { prefix: "/api/v1" });

  const startPromise = server.listen({ port: Number(env.APP_PORT), host: env.APP_HOST });

  const timer = setTimeout(() => {
    logger.error("Startup timed out", { port: env.APP_PORT, host: env.APP_HOST });
    process.exit(1);
  }, 1000);

  console.log("startPromise", await startPromise);
  try {
    const address = await startPromise;
    console.log("address", address);
    clearTimeout(timer);
    logger.all(`Server successfully started on: ${address}`, { address });
    logger.info("Press CTRL-C to stop");
  } catch (err) {
    clearTimeout(timer);
    logger.fatal("Failed to start", { err });
    process.exit(1);
  }

  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, async () => {
      try {
        await gracefulClose(server, sig);
      } catch (err) {
        logger.fatal("Forced shutdown due to error", { err });
        process.exit(1);
      }
    });
  }

  process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", { reason });
  });
  process.on("uncaughtException", (err) => {
    logger.fatal("uncaughtException", { err });
    process.exit(1);
  });

}

async function gracefulClose(server: ReturnType<typeof buildApp>, sig: NodeJS.Signals) {
  logger.warn("Graceful shutdown initiated", { signal: sig });
  const timer = setTimeout(() => {
    logger.fatal("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 1000);

  try {
    await server.close();
    clearTimeout(timer);
    logger.warn("Server closed gracefully");
    process.exit(0);
  } catch (err) {
    clearTimeout(timer);
    logger.fatal("Error during shutdown", { err });
    process.exit(1);
  }
}
void main();