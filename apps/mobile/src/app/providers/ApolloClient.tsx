import {
    ApolloClient,
    ApolloLink,
    InMemoryCache,
    concat,
    createHttpLink,
    split,
} from '@apollo/client';
import { Observable, getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient as createWsClient } from 'graphql-ws';
import { Kind, OperationTypeNode } from 'graphql';
import { useAuthStore } from '../modules/login';
import {
    getGraphQLHttpUrl,
    getGraphQLWsUrl,
    GRAPHQL_CONFIG
} from '../config';

const getAuthHeader = async () => {
    try {
        const authStore = useAuthStore.getState();
        const token = authStore.token;
        if (token) {
            return { headers: { Authorization: `Bearer ${token}` } };
        }
        return null;
    } catch {
        return null;
    }
};

const authLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
        getAuthHeader().then(headers => {
            if (headers) {
                operation.setContext(headers);
            }
            forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
            });
        });
    });
});

const httpLink = createHttpLink({
    uri: getGraphQLHttpUrl(),
    fetchOptions: {
        timeout: GRAPHQL_CONFIG.TIMEOUT,
    },
});

const wsLink: GraphQLWsLink = new GraphQLWsLink(
    createWsClient({
        url: getGraphQLWsUrl(),
        connectionParams: async (): Promise<Record<string, unknown>> => {
            try {
                const authStore = useAuthStore.getState();
                const token: string | null = authStore.token;
                return token ? { Authorization: `Bearer ${token}` } : {};
            } catch {
                return {};
            }
        },
        retryAttempts: 3,
        retryWait: async (retryCount: number): Promise<void> => {
            const delay = Math.min(1000 * 2 ** retryCount, 30000);
            await new Promise(resolve => setTimeout(resolve, delay));
        },
    }),
);

const client: ApolloClient = new ApolloClient({
    link: split(isSubscription, wsLink, concat(authLink, httpLink)),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Add any field policies here if needed
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
        },
        query: {
            errorPolicy: 'all',
        },
    },
});

function isSubscription(operation: OperationTypeNode): boolean {
    const definition = getMainDefinition(operation.query);
    return (
        definition.kind === Kind.OPERATION_DEFINITION &&
        definition.operation === OperationTypeNode.SUBSCRIPTION
    );
}

export default client;