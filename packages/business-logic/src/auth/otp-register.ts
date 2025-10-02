import { getMailer, getRedisWriteClient } from "@mdi/constant-definitions";
import { generateTOTP } from "@mdi/security";

export const otpRegister = async (email: string) => {
    const mailer = getMailer();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    const sessionId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const session = {
        id: sessionId,
        email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };

    const redisWrite = getRedisWriteClient();
    await redisWrite.setex(`registration:${sessionId}`, 1800, JSON.stringify(session));

    if (!process.env.TOTP_SECRET) throw new Error("TOTP_SECRET is not set");
    const verificationCode = await generateTOTP(process.env.TOTP_SECRET);

    const codeKey = `verification:${email}`;
    await redisWrite.setex(codeKey, 1800, verificationCode);

    await mailer.sendTemplate({
        to: email,
        template: {
            name: "otp",
            props: {
                verificationCode,
            },
        },
    });

    return sessionId;
}