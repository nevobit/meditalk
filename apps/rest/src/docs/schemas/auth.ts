export const authSchemas = {
    login: {
        type: "object",
        properties: {
            email: { type: "string" },
            password: { type: "string" },
        },
    },
};