import { findByEmail } from "../users";
import { generateTOTP } from "@mdi/security";
import { getMailer, getRedisWriteClient } from "@mdi/constant-definitions";

export const otpLogin = async (email: string) => {
    const mailer = getMailer();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    const user = await findByEmail(email);
    if (!user) throw new Error("User not found");

    if (!process.env.TOTP_SECRET) throw new Error("TOTP_SECRET is not set");
    const verificationCode = await generateTOTP(process.env.TOTP_SECRET);

    const codeKey = `verification:${email}`;

    const redisWrite = getRedisWriteClient();
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

    return { email: user.email };
};