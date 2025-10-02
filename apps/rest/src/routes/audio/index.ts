import { type RouteOptions } from 'fastify';
import { transcribeAudioRoute } from './transcribe';
import { generateReportRoute } from './generate-report';
import { processAudioRoute } from './process-audio';

export const audioRoutes: RouteOptions[] = [
    transcribeAudioRoute,
    generateReportRoute,
    processAudioRoute,
];
