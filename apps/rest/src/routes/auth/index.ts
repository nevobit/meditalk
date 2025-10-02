import type { RouteOptions } from "fastify";
import { otpLoginRoute } from "./otp-login";
import { otpRegisterRoute } from "./otp-register";
import { otpVerifyRoute } from "./otp-verify";

export const authRoutes: RouteOptions[] = [
    otpLoginRoute,
    otpRegisterRoute,
    otpVerifyRoute
];

