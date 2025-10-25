import { type RouteOptions } from 'fastify';
import { createReport } from '@mdi/business-logic';
import type { CreateReportDto } from '@mdi/contracts';

export const createReportRoute: RouteOptions = {
    method: 'POST',
    url: '/reports',
    handler: async (request, reply) => {
        try {
            const report = await createReport(request.body as CreateReportDto);

            return reply.status(201).send({
                success: true,
                data: report,
                message: 'Report created successfully'
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    type: 'InternalServerError',
                    title: 'Failed to create report',
                    status: 500,
                    detail: error instanceof Error ? error.message : 'Unknown error occurred',
                    instance: request.url
                }
            });
        }
    }
};
