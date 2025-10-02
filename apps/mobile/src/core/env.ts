import Config from 'react-native-config';
import type { GraphQLConfig, AppConfig, AuthConfig, OAuthConfig } from './types';

export const GRAPHQL_CONFIG: GraphQLConfig = {
    HTTP_URL: Config.GRAPHQL_HTTP_URL || 'http://localhost:8000/graphql',
    WS_URL: Config.GRAPHQL_WS_URL || 'ws://192.168.1.57:8000/graphql',
    TIMEOUT: parseInt(Config.API_TIMEOUT || '30000'),
    WS_TIMEOUT: parseInt(Config.WS_TIMEOUT || '10000'),
};

export const APP_CONFIG: AppConfig = {
    NAME: Config.APP_NAME || 'Loobic',
    VERSION: Config.APP_VERSION || '3.0.2',
    ENV: (Config.APP_ENV as 'development' | 'production' | 'staging') || 'development',
};

export const AUTH_CONFIG: AuthConfig = {
    TOKEN_KEY: Config.AUTH_TOKEN_KEY || 'loobic_auth_token',
    REFRESH_TOKEN_KEY: Config.AUTH_REFRESH_TOKEN_KEY || 'loobic_refresh_token',
};

export const OAUTH_CONFIG: OAuthConfig = {
    GOOGLE: {
        WEB_CLIENT_ID: Config.GOOGLE_WEB_CLIENT_ID || '',
    },
    APPLE: {
        SERVICE_ID: Config.APPLE_SERVICE_ID || '',
    },
};

export const isDevelopment = APP_CONFIG.ENV === 'development';
export const isProduction = APP_CONFIG.ENV === 'production';
export const isStaging = APP_CONFIG.ENV === 'staging';

export const getGraphQLHttpUrl = (): string => {
    if (isProduction) {
        return 'https://joobs.real-vision-api.cloud/graphql';
    }
    return GRAPHQL_CONFIG.HTTP_URL;
};

export const getGraphQLWsUrl = (): string => {
    if (isProduction) {
        return 'wss://joobs.real-vision-api.cloud/graphql';
    }
    return GRAPHQL_CONFIG.WS_URL;
};
