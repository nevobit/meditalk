import { createHttpClient } from "../core/client";
import type { SdkOptions } from "../core/types";
import type { RateInfo } from "../core/rate";

type GraphQLErrorItem = { message: string; path?: (string | number)[]; extensions?: Record<string, unknown> };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLErrorItem[] };

export function createGraphQL(options: SdkOptions) {
    const http = createHttpClient(options);

    async function query<T>(gql: string, variables?: Record<string, unknown>) {
        const res = await http.post<GraphQLResponse<T>>("/graphql", { query: gql, variables });
        if (res.data.errors?.length) {
            const first = res.data.errors[0];
            const code = first?.extensions?.code ?? "UNKNOWN";
            throw {
                code: mapGraphQLErrorCode(code as string),
                message: first?.message,
                status: res.status,
                details: res.data.errors
            };
        }
        return { data: res.data.data as T, rate: res.rate as RateInfo };
    }

    return { query, mutate: query };
}

function mapGraphQLErrorCode(code: string) {
    switch (code) {
        case "FORBIDDEN": return "FORBIDDEN";
        case "NOT_FOUND": return "RESOURCE_NOT_FOUND";
        case "RATE_LIMITED": return "RATE_LIMIT_EXCEEDED";
        case "BAD_USER_INPUT": return "VALIDATION_ERROR";
        default: return "UNKNOWN";
    }
}
