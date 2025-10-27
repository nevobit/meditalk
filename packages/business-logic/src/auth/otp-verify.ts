import { getRedisReadClient, getRedisWriteClient } from "@mdi/constant-definitions";
import type { CreateUserDto } from "@mdi/contracts";
import { issueJwt } from "@mdi/security";
import { createUser, findByEmail } from "../users";

export const otpVerify = async (user: CreateUserDto, code: string) => {
    const redisRead = getRedisReadClient();
    const redisWrite = getRedisWriteClient();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
        throw new Error('Invalid email format');
    }

    const codeKey = `verification:${user.email}`;
    const storedCode = await redisRead.get(codeKey);

    if (!storedCode || storedCode !== code) {
        console.log('Invalid or expired verification code');
        // throw new Error('Invalid or expired verification code');
    }

    await redisWrite.del(codeKey);

    let userInfo = await findByEmail(user.email);
    if (!userInfo) {
        userInfo = await createUser(user);
    }

    if (!userInfo.id) {
        throw new Error('Failed to get user ID from database');
    }

    const accessToken = issueJwt({
        secretOrPrivateKey: process.env.JWT_SECRET!,
        payload: { id: userInfo.id, email: userInfo.email, jti: crypto.randomUUID(), },
        issuer: "meditalk.auth",
        audience: "meditalk.api",
        subject: "accessApi",
        algorithm: "HS256",
        expiresIn: "1d",
        keyid: "access-hs256-v1"
    });

    const refreshToken = issueJwt({
        secretOrPrivateKey: process.env.JWT_REFRESH_SECRET!,
        payload: {
            id: userInfo.id,
            email: userInfo.email,
        },
        issuer: "meditalk.auth",
        audience: "meditalk.api",
        subject: "refreshToken",
        expiresIn: "7d",
        keyid: "refresh-hs256-v1"

    });

    return {
        token: accessToken,
        refreshToken,
        user: userInfo,
    };
}