import { type RouteOptions } from 'fastify';
import { findReportsByUserId } from '@mdi/business-logic';

export const findReportsByUserRoute: RouteOptions = {
    method: 'GET',
    url: '/users/:userId/reports',
    handler: async (request, reply) => {
        try {
            const { userId } = request.params as { userId: string };

            if (!userId) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        type: 'BadRequest',
                        title: 'Invalid request',
                        status: 400,
                        detail: 'User ID is required',
                        instance: request.url
                    }
                });
            }

            const reports = await findReportsByUserId(userId);

            return reply.status(200).send({
                success: true,
                data: reports,
                count: reports.length
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    type: 'InternalServerError',
                    title: 'Failed to find reports',
                    status: 500,
                    detail: error instanceof Error ? error.message : 'Unknown error occurred',
                    instance: request.url
                }
            });
        }
    }
};
