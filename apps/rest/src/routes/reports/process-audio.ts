import { type RouteOptions } from 'fastify';
import { processAudioAndSaveReport } from '@mdi/business-logic';
import type { ProcessAudioDto } from '@mdi/contracts';

export const processAudioRoute: RouteOptions = {
    method: 'POST',
    url: '/reports/process-audio',
    handler: async (request, reply) => {
        try {
            const result = await processAudioAndSaveReport(request.body as ProcessAudioDto);

            return reply.status(201).send({
                success: true,
                data: result,
                message: 'Audio processing started successfully'
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    type: 'InternalServerError',
                    title: 'Failed to process audio',
                    status: 500,
                    detail: error instanceof Error ? error.message : 'Unknown error occurred',
                    instance: request.url
                }
            });
        }
    }
};
