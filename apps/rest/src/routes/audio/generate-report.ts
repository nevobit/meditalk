import { type RouteOptions } from 'fastify';
import { generateMedicalReport } from '@mdi/business-logic';
import type { GenerateReportDto, GenerateReportResponse } from '@mdi/contracts';

export const generateReportRoute: RouteOptions = {
    method: 'POST',
    url: '/audio/generate-report',
    handler: async (request, reply) => {
        try {
            const { transcription, templateId, model, language, userId } = request.body as { transcription: string, templateId: string, model: string, language: string, userId: string };

            const generateData: GenerateReportDto = {
                transcription,
                templateId,
                aiConfig: {
                    model: model as "whisper" | "gemini-pro" | "gpt-4",
                    language: language as "es" | "en" | "fr" | "de" | "it" | "pt"
                },
                userId
            };

            const result = await generateMedicalReport(generateData);

            const response: GenerateReportResponse = {
                medicalSummary: result.medicalSummary,
                generalReport: result.generalReport,
                processingTime: result.processingTime
            };

            return reply.send(response);

        } catch (error) {
            console.error('Report generation error:', error);
            return reply.code(500).send({
                error: 'Report generation failed',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
