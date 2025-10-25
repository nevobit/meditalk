import { type RouteOptions } from 'fastify';
import { updateReport } from '@mdi/business-logic';
import type { UpdateReportDto } from '@mdi/contracts';

export const updateReportRoute: RouteOptions = {
    method: 'PUT',
    url: '/reports/:id',
    handler: async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            if (!id) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        type: 'BadRequest',
                        title: 'Invalid request',
                        status: 400,
                        detail: 'Report ID is required',
                        instance: request.url
                    }
                });
            }

            const report = await updateReport(id, request.body as UpdateReportDto);

            return reply.status(200).send({
                success: true,
                data: report,
                message: 'Report updated or created successfully'
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    type: 'InternalServerError',
                    title: 'Failed to update report',
                    status: 500,
                    detail: error instanceof Error ? error.message : 'Unknown error occurred',
                    instance: request.url
                }
            });
        }
    }
};
