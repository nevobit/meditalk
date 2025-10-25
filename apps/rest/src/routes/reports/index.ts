import { type RouteOptions } from 'fastify';
import { createReportRoute } from './create';
import { findReportByIdRoute } from './find-by-id';
import { findReportsByUserRoute } from './find-by-user';
import { updateReportRoute } from './update';
import { processAudioRoute } from './process-audio';

export const reportRoutes: RouteOptions[] = [
    createReportRoute,
    findReportByIdRoute,
    findReportsByUserRoute,
    updateReportRoute,
    processAudioRoute,
];
