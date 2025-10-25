export const PublicRoutes = {
    SIGNIN: "/signin",
    SIGNUP: "/signup",
    FORGOT: "/forgot",
    TESTING: "/testing",
} as const;

export const PrivateRoutes = {
    ROOT: "/",
    DAHSBOARD: "/dahsboard",
    RECORDING: "/recording",
    REPORT_GENERATION: "/report-generation",
    REPORTS_LIST: "/informs",
    REPORT_VIEW: "/reports/:id",
} as const;
