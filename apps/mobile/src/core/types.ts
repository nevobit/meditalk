// Environment configuration types
export interface GraphQLConfig {
    HTTP_URL: string;
    WS_URL: string;
    TIMEOUT: number;
    WS_TIMEOUT: number;
}

export interface AppConfig {
    NAME: string;
    VERSION: string;
    ENV: 'development' | 'production' | 'staging';
}

export interface AuthConfig {
    TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
}

export interface OAuthConfig {
    GOOGLE: {
        WEB_CLIENT_ID: string;
    };
    APPLE: {
        SERVICE_ID: string;
    };
}

// Environment variables interface
export interface EnvironmentVariables {
    GRAPHQL_HTTP_URL?: string;
    GRAPHQL_WS_URL?: string;
    API_TIMEOUT?: string;
    WS_TIMEOUT?: string;
    APP_NAME?: string;
    APP_VERSION?: string;
    APP_ENV?: string;
    AUTH_TOKEN_KEY?: string;
    AUTH_REFRESH_TOKEN_KEY?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    APPLE_SERVICE_ID?: string;
}
