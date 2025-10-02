import { type FastifyInstance, type RouteOptions } from 'fastify';
import { healthCheckRoute } from './health-check';

const routes: RouteOptions[] = [
    healthCheckRoute,
];

export const registerRoutes = (fastify: FastifyInstance) => {
    routes.map((route) => {
        fastify.route(route);
    });
};