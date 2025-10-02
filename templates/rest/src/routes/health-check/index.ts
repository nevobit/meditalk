import { type RouteOptions } from "fastify";
import os from "os";
import { MonoContext } from "@mdi/core-modules";

export const healthCheckRoute: RouteOptions = {
  method: "GET",
  url: "/health-check",
  handler: async (req) => {
    const version = MonoContext.getStateValue("version");
    const name = MonoContext.getStateValue("name");
    const now = new Date();

    // const mongoOk = await mongo.ping().catch(() => false);
    // const postgresqlOk = await postgresql.ping().catch(() => false);
    // const redisOk = await redis.ping().catch(() => false);

    return {
      service: {
        name,
        version,
        host: os.hostname(),
        env: process.env.NODE_ENV,
      },
      status: "ok",
      uptime: process.uptime(),
      timestamp: now.toISOString(),
      requestId: req.id,
      // dependencies: {
      //   mongo: mongoOk ? "ok" : "down",
      //   redis: redisOk ? "ok" : "down",
      // },
    };
  },
};
