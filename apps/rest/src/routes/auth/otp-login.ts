import { type RouteOptions } from "fastify";
import { otpLogin } from "@mdi/business-logic";

export const otpLoginRoute: RouteOptions = {
    method: "POST",
    url: "/auth/otp",
    handler: async (req, reply) => {
        const { email } = req.body as { email: string };
        const userEmail = await otpLogin(email);
        reply.send(userEmail);
    },
};
