import { RouteOptions, FastifyRequest, FastifyReply } from 'fastify';
import { NormalizedRequest } from '../../types';
import { normalizeFastifyRequest } from '../normalize-fastify-request';

export enum RouteMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
}

declare module "fastify" {
    interface FastifyRequest {
        user?: unknown;
    }
}

export const makeFastifyRoute = (
    method: RouteMethod,
    url: string,
    authFunction: (req: NormalizedRequest) => Promise<unknown>,
    handler: (
        req: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>,
    extraOptions?: Partial<Omit<RouteOptions, "handler">>,
): RouteOptions => {
    const enhancedHandler: RouteOptions["handler"] = async (request: FastifyRequest, reply: FastifyReply) => {
        const normalizedReq = normalizeFastifyRequest(request);
        const user = await authFunction(normalizedReq);
        request.user = user;
        return handler(request, reply);
    };

    return {
        ...extraOptions,
        method,
        url,
        handler: enhancedHandler
    }
}