import { findById } from '../users';
import { issueJwt, verifyJwt } from '@mdi/security';

const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

type RefreshTokenPayload = {
    id: string;
    email: string;
    sub: string;
};

export const refreshToken = async (token: string) => {
    try {
        const result = verifyJwt<RefreshTokenPayload>(token, {
            secretOrPublicKey: JWT_REFRESH_SECRET!,
            audience: "meditalk.api",
            issuer: "meditalk.auth",
            required: {
                sub: true,
            },
        });

        if (!result.ok) {
            throw new Error(result.message);
        }

        const decodedToken = result.payload;

        const user = await findById(decodedToken.id);
        if (!user) {
            throw new Error('User not found');
        }

        const accessToken = issueJwt({
            secretOrPrivateKey: JWT_SECRET!,
            payload: { id: user.id, email: user.email, jti: crypto.randomUUID(), },
            issuer: "meditalk.auth",
            audience: "meditalk.api",
            subject: "accessApi",
            algorithm: "HS256",
            expiresIn: "1d",
            keyid: "access-hs256-v1"
        });

        const newRefreshToken = issueJwt({
            secretOrPrivateKey: process.env.JWT_REFRESH_SECRET!,
            payload: {
                id: user.id,
                email: user.email,
            },
            issuer: "meditalk.auth",
            audience: "meditalk.api",
            subject: "refreshToken",
            expiresIn: "7d",
            keyid: "refresh-hs256-v1"

        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        };
    } catch {
        throw new Error('Invalid refresh token');
    }
};