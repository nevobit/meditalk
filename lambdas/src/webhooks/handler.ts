export const handler = async (event) => {
    const body = event.body || "";
    JSON.parse(body);

    return { statusCode: 200, body: "ok" };
};
