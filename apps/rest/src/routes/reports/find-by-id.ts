import { type RouteOptions } from 'fastify';
import { findReportById } from '@mdi/business-logic';

export const findReportByIdRoute: RouteOptions = {
    method: 'GET',
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

            const report = await findReportById(id);

            if (!report) {
                return reply.status(404).send({
                    success: false,
                    error: {
                        type: 'NotFound',
                        title: 'Report not found',
                        status: 404,
                        detail: `Report with ID ${id} not found`,
                        instance: request.url
                    }
                });
            }

            return reply.status(200).send({
                success: true,
                data: report
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    type: 'InternalServerError',
                    title: 'Failed to find report',
                    status: 500,
                    detail: error instanceof Error ? error.message : 'Unknown error occurred',
                    instance: request.url
                }
            });
        }
    }
};
