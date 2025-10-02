export function mapVerifyCode(code?: number): number {
    if (typeof code === "number" && code >= 100 && code < 600) {
        return code;
    }
    switch (code) {
        case 1001: return 401;
        case 1002: return 401;
        case 1003: return 403;

        case 1101: return 400;
        case 1102: return 400;
        case 1103: return 400;

        case 1201: return 429;

        case 1301: return 503;

        case 0:
        case undefined:
        case null:
            return 200;

        default:
            return 400;
    }
}
