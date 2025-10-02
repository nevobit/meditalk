// import { User } from '@mdi/contracts';

export interface GraphQLContext {
    req: {
        headers: {
            authorization?: string;
        };
        url: string;
    };
    // user: User | null;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    email?: string;
    userExists?: boolean;
    sessionId?: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    // user: Partial<User>;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    // user: Partial<User>;
}

export interface ResolverArgs {
    id: string;
}

export interface ResolverContext {
    // user: User | null;
    req: {
        headers: {
            authorization?: string;
        };
        url: string;
    };
}
