import { type FastifyInstance, type RouteOptions } from 'fastify';
import { healthCheckRoute } from './health-check';
import { authRoutes } from './auth';
import { audioRoutes } from './audio';
import { pdfRoutes } from './pdf';

const routes: RouteOptions[] = [
    healthCheckRoute,
    ...authRoutes,
    ...audioRoutes,
    ...pdfRoutes,
];

export const registerRoutes = (fastify: FastifyInstance) => {
    routes.map((route) => {
        fastify.route(route);
    });
};