import 'dotenv/config';
import os from 'os';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import {
    fastifyApolloDrainPlugin,
    fastifyApolloHandler,
} from '@as-integrations/fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/dist/use/ws';
import {
    ConsoleTransport,
    Logger,
    LoggerTransportName,
    MonoContext,
} from '@mdi/core-modules';
import { getLogger, setLogger } from '@mdi/constant-definitions';
import { initDataSources } from '@mdi/data-sources';
import { version, name } from '../../package.json';
import { typeDefs } from '../typedefs';
import resolvers from '../resolvers';
import { createContext } from '../resolvers/context';
import type { HTTPMethods } from 'fastify/types/utils';

const { APP_PORT, METHODS, CORS_ORIGIN, DATABASE_URL, REDIS_HOST, REGION, ENVIRONMENT } =
    process.env;

const methods = METHODS!.split(',') as HTTPMethods[];

const consoleOptions = {
    transport: LoggerTransportName.CONSOLE,
    options: {
        destination: LoggerTransportName.CONSOLE,
        channelName: LoggerTransportName.CONSOLE,
    },
};
const logger = new Logger({
    optionsByLevel: {
        debug: [consoleOptions],
        info: [consoleOptions],
        warn: [consoleOptions],
        error: [consoleOptions],
        fatal: [consoleOptions],
        all: [consoleOptions],
        raw: [consoleOptions],
    },
    transports: {
        [LoggerTransportName.CONSOLE]: ConsoleTransport,
    },
    appIdentifiers: {
        region: REGION,
        clusterType: '',
        hostname: os.hostname(),
        app: name,
        version: version,
        environment: ENVIRONMENT,
        developer: os.userInfo().username,
    },
    catchTransportErrors: true,
    logLevel: 'all',
});

const corsOptions = {
    origin: CORS_ORIGIN!.split(','),
};

setLogger(logger);

MonoContext.setState({
    version,
    secret: null,
});

const main = async () => {
    await initDataSources({
        postgresqldb: {
            postgresUrl: DATABASE_URL,
        },
        redisdb: {
            redisReadUrl: REDIS_HOST,
            redisWriteUrl: REDIS_HOST,
        },
    });
    const app = fastify();
    await app.register(fastifyCors, corsOptions);

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const server = new ApolloServer({
        schema,
        plugins: [fastifyApolloDrainPlugin(app)],
        introspection: true,
        apollo: {},
    });
    await server.start();

    app.route({
        url: '/graphql',
        method: methods,
        handler: fastifyApolloHandler(server, {
            context: async (request) => await createContext(request),
        }),
    });

    const wsServer = new WebSocketServer({
        server: app.server,
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);

    app.addHook('onClose', async () => {
        await serverCleanup.dispose();
    });

    await app.listen({ port: Number(APP_PORT) });
    getLogger().info(`Server running on http://localhost:${APP_PORT}`);
    getLogger().info(`GraphQL endpoint: http://localhost:${APP_PORT}/graphql`);
};

void main();