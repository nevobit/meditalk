import { type RouteOptions } from "fastify";
import { otpVerify } from "@mdi/business-logic";

export const otpVerifyRoute: RouteOptions = {
    method: "POST",
    url: "/auth/otp/verify",
    handler: async (req, reply) => {

        const { email, code, name, identification, country, city } = req.body as { email: string; code: string; name: string; identification: string; city: string; country: string; voiceSample: string; avatar: string; emailVerifiedAt: Date; lastLoginAt: Date };
        const user = await otpVerify({
            email, name, identification, country,
            city,
            voiceSample: "",
            avatar: "",
            emailVerifiedAt: new Date(),
            lastLoginAt: new Date()
        }, code);
        reply.send(user);
    },
};
