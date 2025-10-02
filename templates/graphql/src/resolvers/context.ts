// import { findUserById, verifyToken } from '@mdi/business-logic';
import { ConsoleTransport, Logger, LoggerTransportName, MonoContext } from '@mdi/core-modules';
import type { GraphQLContext } from '../types';
import { setLogger } from '@mdi/constant-definitions';

interface FastifyRequest {
    headers: {
        authorization?: string;
    };
    url: string;
}

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
    transports: { [LoggerTransportName.CONSOLE]: ConsoleTransport },
    appIdentifiers: {
        clusterType: "",
        hostname: "os.hostname()",
        app: "name",
        version: "1.1.1",
        environment: "dev",
        developer: "os.userInfo().username",
    },
    catchTransportErrors: true,
    logLevel: "all",
});

setLogger(logger);
MonoContext.setState({ version: "1.1.1", secret: null });


// interface DecodedToken {
//     id: string;
//     email: string;
// }

export const createContext = async (request: FastifyRequest): Promise<GraphQLContext> => {
    const context: GraphQLContext = {
        req: request,
        // user: null
    };

    try {
        const { headers } = request;
        const authHeader = headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // const token = authHeader.substring(7);

            // const result = await verifyToken({
            //     headers: { authorization: `Bearer ${token}` },
            //     body: {},
            //     protocol: 'http',
            //     url: request.url
            // });

            // if (result.type === 'success' && result.message) {
            //     const decodedToken = result.message as DecodedToken;

            //     if (decodedToken.id) {
            //         const user = await findUserById(decodedToken.id);
            //         if (user) {
            //             // context.user = user;
            //         }
            //     }
            // }
        }
    } catch {
        logger.error('Context authentication error:');
    }

    return context;
};
