export type SdkErrorCode =
    | "AUTH_REQUIRED"
    | "RATE_LIMIT_EXCEEDED"
    | "RESOURCE_NOT_FOUND"
    | "RESOURCE_ALREADY_EXISTS"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "CONFLICT"
    | "SERVER_ERROR"
    | "NETWORK_ERROR"
    | "UNKNOWN";

export type SdkError = {
    code: SdkErrorCode;
    message: string;
    status?: number;
    requestId?: string;
    details?: unknown;
};

export function makeError(input: Partial<SdkError> & { message: string }): SdkError {
    return {
        code: input.code ?? "UNKNOWN",
        message: input.message,
        status: input.status,
        requestId: input.requestId,
        details: input.details
    };
}
