import { type FastifyInstance, type RouteOptions } from 'fastify';
import { healthCheckRoute } from './health-check';
import { authRoutes } from './auth';
import { audioRoutes } from './audio';

const routes: RouteOptions[] = [
    healthCheckRoute,
    ...authRoutes,
    ...audioRoutes,
];

export const registerRoutes = (fastify: FastifyInstance) => {
    routes.map((route) => {
        fastify.route(route);
    });
};