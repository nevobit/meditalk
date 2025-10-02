import { type RouteOptions } from "fastify";
import { otpRegister } from "@mdi/business-logic";

export const otpRegisterRoute: RouteOptions = {
    method: "POST",
    url: "/auth/otp/register",
    handler: async (req, reply) => {
        const { email } = req.body as { email: string };
        console.log("req.body", req.body);
        console.log("email", email);
        const sessionId = await otpRegister(email);
        reply.send(sessionId);
    },
};
